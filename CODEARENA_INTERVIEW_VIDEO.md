# CodeArena, Interview & Video Recording — Technical Deep Dive

This document explains the internal workings of three major subsystems in CodeNexus: the **CodeArena** competitive coding module, the **Interview** module, and the **Video Recording & Transcoding** pipeline. It is intended for developers who need to understand, debug, or extend these features.

---

## Table of Contents

1. [CodeArena](#1-codearena)
   - [Database Models](#11-database-models)
   - [Problem Browsing](#12-problem-browsing)
   - [Running Code (Test Mode)](#13-running-code-test-mode)
   - [Submitting Code (Judge Mode)](#14-submitting-code-judge-mode)
   - [Judge0 Integration](#15-judge0-integration)
   - [Submission Queue (Bull/Redis)](#16-submission-queue-bullredis)
   - [Leaderboard & Scoring](#17-leaderboard--scoring)
   - [Rate Limiting](#18-rate-limiting)
   - [API Reference](#19-api-reference)
2. [Interview Module](#2-interview-module)
   - [Database Models](#21-database-models)
   - [Interview Lifecycle](#22-interview-lifecycle)
   - [Role-Based Access](#23-role-based-access)
   - [Joining an Interview Room](#24-joining-an-interview-room)
   - [In-Room Features](#25-in-room-features)
   - [Post-Interview Evaluation](#26-post-interview-evaluation)
   - [API Reference](#27-api-reference)
3. [Video Recording & Transcoding](#3-video-recording--transcoding)
   - [Architecture Overview](#31-architecture-overview)
   - [Mediasoup WebRTC Layer](#32-mediasoup-webrtc-layer)
   - [Socket.io Signaling](#33-socketio-signaling)
   - [Recording Manager](#34-recording-manager)
   - [RTP Port Pool](#35-rtp-port-pool)
   - [FFmpeg Pipeline](#36-ffmpeg-pipeline)
   - [Complete Recording Data Flow](#37-complete-recording-data-flow)
   - [Downloading a Recording](#38-downloading-a-recording)
   - [Environment Variables](#39-environment-variables)
4. [Cross-Module Integration Points](#4-cross-module-integration-points)

---

## 1. CodeArena

CodeArena is a self-contained competitive coding platform modelled after LeetCode. Students browse problems, write solutions in the browser, get real-time execution feedback, and accumulate a global score that drives the leaderboard.

### 1.1 Database Models

All CodeArena data lives in five Prisma models:

| Model | Purpose |
|---|---|
| `CaProblem` | Problem repository — title, description, difficulty, tags, time/memory limits |
| `CaTestCase` | Individual test cases attached to a problem; `isSample` controls visibility |
| `CaSubmission` | One record per submit action — stores language, code, status, Judge0 token |
| `CaRunResult` | Lightweight record of every "Run" action (not a full submission) |
| `CaSubmissionSummary` | Per-user, per-problem progress — solved status, best runtime, attempt count |

`CaProblem` only appears in the problem list when `isPublished = true`. `CaTestCase.isSample = true` rows are shown to the user in the problem view; hidden rows are only used during submission evaluation.

### 1.2 Problem Browsing

**File:** `backend/src/modules/codearena/problems.controller.ts`

`GET /codearena/problems` — accepts optional `difficulty` and `tags` query parameters. For each problem the controller computes:

- **Acceptance rate** — `(accepted submissions / total submissions) * 100`
- **User solve status** — looks up the requesting user's `CaSubmissionSummary` to flag problems they have already solved

`GET /codearena/problems/:id` — returns the full problem including only the sample test cases. Hidden test cases are never sent to the client.

### 1.3 Running Code (Test Mode)

**File:** `backend/src/modules/codearena/submissions.controller.ts` → `runCode()`

The "Run" button executes code against the sample test cases only (or a custom input the user types). The flow is:

```
Client POSTs /codearena/run
        ↓
Rate limiter checks: 30 runs / 60 s per user (Redis INCR)
        ↓
For each sample test case:
  1. Base64-encode source code
  2. POST to Judge0 /submissions?base64_encoded=true
     → Returns a Judge0 token
  3. Poll GET /submissions/{token} every 1 s (max 20 attempts)
  4. Decode base64 stdout/stderr from result
        ↓
Aggregate verdicts across all test cases
        ↓
Asynchronously persist CaRunResult (does NOT affect score)
        ↓
Return verdict + per-test breakdown to client
```

Response includes: `verdict`, `errorMessage`, `executionTimeMs`, `memoryKb`, per-test `passed/actual/expected` arrays.

### 1.4 Submitting Code (Judge Mode)

**File:** `backend/src/modules/codearena/submissions.controller.ts` → `submitCode()`

Submitting runs code against **all** test cases (including hidden ones) asynchronously:

```
Client POSTs /codearena/submit
        ↓
Rate limiter checks: 10 submits / 60 s per user
        ↓
CaSubmission record created with status = "queued"
        ↓
Job pushed to Bull queue "codearena:submissions"
        ↓
HTTP 202 returned immediately with { submissionId }
        ↓
Queue processor runs (see §1.6)
        ↓
Result delivered via WebSocket "submission_result" event
```

The client can also poll `GET /codearena/submissions/:id` to check status without relying on the socket.

### 1.5 Judge0 Integration

**File:** `backend/src/modules/codearena/judge0.ts`

Judge0 is a self-hosted or cloud code execution engine. CodeNexus communicates with it over HTTP.

**Language ID mapping:**

| Language | Judge0 ID |
|---|---|
| Python 3 | 71 |
| C++ | 54 |
| Java | 62 |
| JavaScript | 63 |
| C | 50 |

**Polling strategy:** After submitting a batch to Judge0 the service polls the token endpoint every 1 second for up to 20 seconds. Judge0 status codes in processing state (1 = In Queue, 2 = Processing) cause a retry; any other code is treated as a final result.

**Verdict priority order** (first matching wins across all test cases):

```
Compilation Error > Runtime Error > Time Limit Exceeded >
Memory Limit Exceeded > Wrong Answer > Accepted
```

This means a single compilation error overrides any passing test cases.

### 1.6 Submission Queue (Bull/Redis)

**File:** `backend/src/modules/codearena/submissionQueue.ts`

The queue name is `codearena:submissions`. Concurrency defaults to 5 (override with `BULL_CONCURRENCY` env var).

**Job processor steps:**

```
1. Verify contest hasn't ended (lock if so)
2. Update CaSubmission.status → "processing"
   Emit WebSocket "submission_processing" to user's room
3. Fetch all test cases for the problem (including hidden)
4. Submit each test case to Judge0 (§1.5)
5. Determine final verdict
6. UPDATE CaSubmission with: status, verdict, executionTimeMs,
   memoryKb, passedTestCases, totalTestCases, errorMessage
7. Upsert CaSubmissionSummary:
   - If accepted: mark isSolved = true, store bestExecutionTimeMs
   - Increment attemptCount always
8. If accepted: call leaderboardService.updateGlobalLeaderboard()
9. Emit WebSocket "submission_result" with final result
10. On job failure: update CaSubmission.status → "runtime_error"
```

### 1.7 Leaderboard & Scoring

**File:** `backend/src/modules/codearena/leaderboard.service.ts`
**File:** `backend/src/modules/codearena/leaderboard.controller.ts`

**Storage:** Redis sorted sets
- Global: `leaderboard:global`
- Per-contest: `leaderboard:contest:{contestId}`
- Cache: `lb_cache:*` with 60-second TTL

**Global score formula:**
```
score = solvedCount × 100
```

**Contest score formula (penalized like ICPC):**
```
score = (problemsSolved × 10000)
      - (wrongAttempts × 50)
      - floor(timeTakenMinutes)
```

**Tier system** (based on global score):

| Tier | Score Range |
|---|---|
| Grandmaster | 2000 + |
| Master | 1500 – 1999 |
| Candidate Master | 1000 – 1499 |
| Expert | 500 – 999 |
| Specialist | 100 – 499 |
| Pupil | 0 – 99 |

`GET /codearena/leaderboard` returns the top-N users plus the requesting user's own rank (even if outside top-N). The rank is computed with `ZREVRANK` on the Redis sorted set.

`GET /codearena/leaderboard/profile` returns the user's:
- Total / solved problem counts broken down by EASY / MEDIUM / HARD
- Global rank and score
- Last 5 submission records

### 1.8 Rate Limiting

**File:** `backend/src/modules/codearena/rateLimiter.ts`

Uses Redis `INCR` + `EXPIRE` (set-if-not-exists pattern) per user (`cnid`) or IP.

| Endpoint | Limit |
|---|---|
| `/run` | 30 requests / 60 s |
| `/submit` | 10 requests / 60 s |

Returns HTTP 429 with a `retry_after_seconds` field when the limit is exceeded.

### 1.9 API Reference

**Problems**
```
GET  /codearena/problems          ?difficulty=EASY&tags=array
GET  /codearena/problems/:id
```

**Submissions**
```
POST /codearena/submissions/run   body: { problemId, language, code, customInput? }
POST /codearena/submissions/submit body: { problemId, language, code }
GET  /codearena/submissions       ?page=1&limit=20
GET  /codearena/submissions/:id
```

**Leaderboard**
```
GET  /codearena/leaderboard       ?limit=50
GET  /codearena/leaderboard/profile
```

---

## 2. Interview Module

The Interview module handles the full lifecycle of a technical interview: scheduling, joining a live room with video/code/whiteboard, recording, chat, and post-interview evaluation.

### 2.1 Database Models

| Model | Purpose |
|---|---|
| `Interview` | Core record — participants, role, type, status, scheduled time |
| `Recording` | Legacy: stores external video URL + recruiter verdict/notes |
| `InterviewRecording` | Server-side recording metadata — file path, size, duration, status |
| `RecordingTimestamp` | Moment markers added during a recording (offsetMs, type, label) |
| `InterviewMessage` | Persistent chat messages between participants |
| `Evaluation` | Post-interview scorecard — technical/communication/culture scores, verdict |

**Interview.type** values: `TECHNICAL`, `HR`, `SYSTEM_DESIGN`

**Interview.status** transitions:
```
SCHEDULED → IN_PROGRESS (when both users join) → COMPLETED
                                               → CANCELLED
```

### 2.2 Interview Lifecycle

```
[Recruiter/Admin] schedules interview
        ↓
Interview record created (status = SCHEDULED)
        ↓
Both parties see it on their dashboard
        ↓
5 minutes before scheduledAt: join link becomes active
        ↓
First user joins → room created in mediasoup
Second user joins → Interview.status set to IN_PROGRESS
        ↓
Live session: video + code editor + whiteboard + chat
Recruiter can: start/stop recording, add timestamps, push coding questions
        ↓
Recruiter ends interview → Interview.status = COMPLETED
        ↓
Recruiter fills evaluation form (verdict, scores, notes)
        ↓
Company admin can download the MP4 recording
```

### 2.3 Role-Based Access

**File:** `backend/src/modules/interview/interview.controller.ts`

| Action | STUDENT | RECRUITER | COMPANY_ADMIN |
|---|---|---|---|
| Schedule interview | No | Yes | Yes (must provide recruiterId) |
| View interviews | Own only | Own only | All company interviews |
| Join room | Yes | Yes | No |
| Start/stop recording | No | Yes | No |
| Download recording | No | Yes | Yes |
| View server recording status | No | Yes | Yes |
| Add timestamps | No | Yes | No |
| Save evaluation | No | Yes | No |
| View messages | Participants | Participants | No |

### 2.4 Joining an Interview Room

**File:** `frontend/src/components/Interview/InterviewRoom.tsx`

The frontend enforces a timing gate: a user cannot join more than 5 minutes before the scheduled time. After passing this check:

1. `GET /interview/:id/join` — server validates the user is a participant
2. Socket connects and emits `join-room` with `{ interviewId }`
3. Server verifies participant status, joins the socket to room `interview-{interviewId}`
4. If there are existing producers in the room, the server immediately sends them so the late-joiner can subscribe
5. When the room reaches 2+ connected users, the server updates `Interview.status = IN_PROGRESS`
6. The server re-hydrates the late-joiner with: cached whiteboard SVG state, Yjs CRDT document state (for collaborative code), and existing chat messages

### 2.5 In-Room Features

The interview room operates in three modes, switchable in real time (synchronized to all participants via `mode-change` socket event):

**`video` mode**
- Local camera/mic stream via WebRTC
- Remote participant video via mediasoup consumer
- Picture-in-Picture layout

**`ide` mode** (`InterviewEditor.tsx`)
- Collaborative code editor backed by **Yjs CRDT**
- `yjs-update` events propagate document changes to all participants
- Recruiter can push a coding problem from their question bank (`push-question` event)

**`whiteboard` mode** (`Whiteboard.tsx`)
- Canvas drawing synchronized via `whiteboard-sync` events
- Full whiteboard state cached on server for late-joiner hydration

**Chat**
- Messages sent via `chat-message` socket event
- Persisted to `InterviewMessage` in the database
- Broadcast to all room members except the sender (optimistic UI on sender side)

**Timestamps**
- Recruiter clicks "Mark moment" → `add-timestamp` event
- Server saves to `RecordingTimestamp` with `offsetMs` (milliseconds since recording started)
- Broadcast to room; displayed as markers on the recording timeline

### 2.6 Post-Interview Evaluation

After `interview-ended` is emitted the recruiter sees a rating/summary modal. They submit:

- `verdict`: SELECTED / REJECTED / PENDING
- `rating`: 0 – 5 stars
- `technicalScore`, `communicationScore`, `cultureScore`
- `notes`

This calls `POST /interview/:id/recording` (saves `Recording`) and writes the `Evaluation` model. Company admins can later view these scores alongside the downloaded video.

### 2.7 API Reference

```
GET    /interview                            List interviews (role-filtered)
GET    /interview/students                   Available students (recruiter/admin)
GET    /interview/company-recruiters         Company recruiters (admin only)
GET    /interview/:id                        Interview details + relations
GET    /interview/:id/join                   Validate join permission
GET    /interview/:id/messages               Chat history
GET    /interview/:id/timestamps             Recording markers
GET    /interview/:id/recording              Server recording status
GET    /interview/:id/recording/download     Download MP4 (recruiter/admin)
POST   /interview                            Schedule interview
POST   /interview/:id/recording             Save evaluation / video URL
PUT    /interview/:id                        Update (recruiter only)
DELETE /interview/:id                        Cancel (recruiter only)
```

---

## 3. Video Recording & Transcoding

This is the most complex subsystem. It captures audio and video from WebRTC streams on the server, mixes them with FFmpeg in real time, and writes an MP4 file to disk — all without requiring the client to upload anything.

### 3.1 Architecture Overview

```
Browser (WebRTC producer)
        │  DTLS/SRTP (encrypted)
        ▼
mediasoup WebRTC Transport
        │  consume → PlainTransport (unencrypted RTP)
        ▼
RTP UDP socket on allocated port (20000-20200)
        │  SDP file describing the stream
        ▼
FFmpeg process (reads RTP via SDP)
        │  filter_complex: mix audio, hstack video
        ▼
MP4 file on disk  ← {RECORDING_BASE_PATH}/{interviewId}/recording.mp4
```

There is no intermediate transcoding step: FFmpeg reads the raw RTP packets as they arrive and encodes directly to MP4, so the output file grows continuously during the session.

### 3.2 Mediasoup WebRTC Layer

**File:** `backend/src/lib/mediasoup.ts`

**Workers:** One mediasoup worker is spawned per CPU core. Workers are round-robin assigned to new routers.

**Per-interview router:** When the first user joins an interview, a mediasoup `Router` is created for that room. It supports two codecs:
- **Audio:** Opus (48000 Hz, 2 channels)
- **Video:** VP8

**Global maps maintained:**
```
routers     : roomId      → Router
transports  : transportId → WebRtcTransport
producers   : producerId  → Producer
consumers   : consumerId  → Consumer
```

These maps are used by the recording manager to create plain transports that tap into existing producer streams.

### 3.3 Socket.io Signaling

**File:** `backend/src/socket/socket.ts`

WebRTC setup requires a signaling exchange before media flows. The sequence for a new participant:

```
Client                              Server
  │── getRouterRtpCapabilities ────→│  Returns codec list
  │← rtpCapabilities ───────────────│
  │
  │── createWebRtcTransport ────────→│  Creates WebRtcTransport
  │← { id, iceParameters,          │
  │    iceCandidates, dtlsParameters}│
  │
  │── connectWebRtcTransport ────────→│  Completes DTLS handshake
  │
  │── produce { kind, rtpParameters }→│  Creates Producer
  │← { producerId } ────────────────│
  │                                  │  Broadcasts "new-producer" to room
  │                                  │  Calls addProducerToRecording()
  │
  │── consume { producerId } ────────→│  Creates Consumer
  │← { id, producerId, kind,        │
  │    rtpParameters } ─────────────│
```

**Recording control events (recruiter only):**
```
start-recording  →  startRecording(interviewId, router)
                     emits "recording-started" to room

stop-recording   →  stopRecording(interviewId)
                     emits "recording-stopped" to room

add-timestamp    →  DB insert + broadcast timestamp to room

interview-ended  →  stopRecording() + Interview.status = COMPLETED
```

### 3.4 Recording Manager

**File:** `backend/src/lib/recording.manager.ts`

This is the heart of the recording pipeline. It maintains a `Map<interviewId, RecordingSession>` where each session tracks:

```typescript
interface RecordingSession {
    interview_id: string
    ffmpegProcess: ChildProcess | null
    plainTransports: Map<producerId, PlainTransport>
    consumers: Map<producerId, Consumer>
    rtpPorts: Map<producerId, { port, kind, trackType }>
    outputPath: string        // path to recording.mp4
    logPath: string           // path to ffmpeg.log
    startedAt: Date
    portPool: Set<number>     // RTP ports in use by this session
    retryCount: number        // FFmpeg restart attempts (max 1)
}
```

**`startRecording(interviewId, router)`**

1. Creates output directory: `{RECORDING_BASE_PATH}/{interviewId}/`
2. Inserts `InterviewRecording` row with `status = "recording"`
3. Initializes an empty `RecordingSession`
4. Returns early if a session for this interview already exists

**`addProducerToRecording(interviewId, producer, router)`**

Called automatically every time a user's `produce` event fires:

1. Creates a `PlainTransport` on the router — this is an unencrypted RTP endpoint that the server controls
2. Calls `plainTransport.connect({ ip, port })` to aim it at an allocated UDP port
3. Creates a `Consumer` on the plain transport that mirrors the producer's stream
4. Records the port, kind (audio/video), and trackType (camera/screen/mic)
5. If the session now has at least one audio track **and** one video track → calls `spawnFFmpeg()`

**`removeProducerFromRecording(interviewId, producerId)`**

Called when a participant disconnects mid-interview:

1. Closes the consumer and plain transport for that producer
2. Releases the RTP port back to the global pool
3. Deletes the SDP file for that producer
4. Recording continues with the remaining participants' streams

**`stopRecording(interviewId)`**

1. Closes all consumers and plain transports in the session
2. Sends `SIGTERM` to the FFmpeg process; waits 10 seconds then `SIGKILL` if still running
3. Reads the final file size from disk
4. Updates `InterviewRecording`: `status = "completed"`, `file_size_bytes`, `duration_seconds`, `completed_at`
5. Releases all RTP ports
6. Removes the session from the active map

### 3.5 RTP Port Pool

**File:** `backend/src/lib/recording.manager.ts` (top-level)

A global `Set<number>` (`globalUsedPorts`) tracks which ports in the range `RECORDING_RTP_PORT_MIN`–`RECORDING_RTP_PORT_MAX` (default 20000–20200) are currently in use across **all** active recording sessions.

```
allocateGlobalPort() → finds first available port, adds to set, returns port
releaseGlobalPort()  → removes port from set
```

This prevents two simultaneous recordings from colliding on the same UDP port.

### 3.6 FFmpeg Pipeline

**File:** `backend/src/lib/recording.manager.ts` → `spawnFFmpeg()`

**Step 1 — Generate SDP files**

For each producer in the session, an SDP file is written to disk:

```sdp
v=0
o=- 0 0 IN IP4 127.0.0.1
s=FFmpeg
c=IN IP4 127.0.0.1
t=0 0
m=video 20042 RTP/AVP 96
a=rtpmap:96 VP8/90000

m=audio 20040 RTP/AVP 111
a=rtpmap:111 opus/48000/2
```

The `m=` line specifies the local UDP port that the plain transport is forwarding to.

**Step 2 — Build FFmpeg arguments**

Input section (one `-i` per producer):
```
-protocol_whitelist file,rtp,udp
-i /path/to/{producerId}.sdp
```

Filter complex:
- **1 audio track:** passed through directly
- **2+ audio tracks:** `amix=inputs=N:duration=longest`
- **1 video track:** passed through directly
- **2 video tracks:** `hstack=inputs=2` (side-by-side layout)

Output encoding:
```
-c:v libx264 -preset ultrafast -crf 23
-c:a aac -ar 44100 -b:a 128k
-movflags +faststart
/path/to/{interviewId}/recording.mp4
```

`+faststart` moves the MP4 metadata (moov atom) to the front of the file, enabling progressive streaming of the completed file.

**Step 3 — Process lifecycle**

FFmpeg is spawned as a child process. stdout/stderr are piped to `{interviewId}/ffmpeg.log`.

On unexpected exit (non-zero code):
- If `retryCount < 1`: increment counter, wait 2 s, call `spawnFFmpeg()` again
- If retry exhausted: update `InterviewRecording.status = "failed"` with `error_message`

On clean exit (code 0 or null after SIGTERM):
- File size and duration are calculated and saved to DB

### 3.7 Complete Recording Data Flow

```
1. Recruiter emits start-recording
         ↓
2. startRecording(interviewId, router)
   → DB: InterviewRecording { status: "recording" }
   → Memory: RecordingSession initialized
         ↓
3. Each participant's camera/mic produce event fires
   addProducerToRecording(interviewId, producer, router):
     a. PlainTransport created on router
     b. Consumer created (mirrors producer stream → plain RTP)
     c. RTP port allocated (e.g. port 20042)
     d. PlainTransport.connect({ ip:"127.0.0.1", port:20042 })
     e. SDP file written for this producer
         ↓
4. When session has ≥1 audio + ≥1 video producer:
   spawnFFmpeg():
     a. Write SDP files (if not already written)
     b. Build -i args for each SDP
     c. Build filter_complex (mix/layout)
     d. Spawn: ffmpeg [inputs] [filter] [output.mp4]
     e. FFmpeg opens UDP sockets, reads RTP packets, encodes
         ↓
5. Live session continues — FFmpeg writes MP4 frames to disk continuously
         ↓
6. Recruiter emits stop-recording (or interview-ended)
   stopRecording(interviewId):
     a. Close all consumers + plain transports
     b. SIGTERM → FFmpeg (10s grace → SIGKILL)
     c. FFmpeg flushes and closes MP4
     d. DB: InterviewRecording { status:"completed", file_size_bytes, duration_seconds }
     e. Release RTP ports
         ↓
7. MP4 available at: {RECORDING_BASE_PATH}/{interviewId}/recording.mp4
```

### 3.8 Downloading a Recording

**File:** `backend/src/modules/interview/interview.controller.ts` → `downloadServerRecording()`

`GET /interview/:id/recording/download` (recruiter or company admin only)

The controller:
1. Validates `InterviewRecording` exists and `status = "completed"`
2. Checks the file exists on disk with `fs.existsSync()`
3. Returns `{ fileName, filePath, fileSize }` — the actual file streaming is handled by the framework using these values with appropriate `Content-Disposition` and `Content-Type: video/mp4` headers

**Status endpoint:** `GET /interview/:id/recording` returns the current state:

```json
{
  "status": "completed",
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T11:30:00Z",
  "duration_seconds": 5400,
  "file_size_bytes": 892341120
}
```

If a session is still active (in-progress), the status comes from the in-memory `RecordingSession`. Once stopped, it falls back to the `InterviewRecording` DB row.

### 3.9 Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `RECORDING_BASE_PATH` | `{project}/recordings` | Root directory for all MP4 output |
| `RECORDING_RTP_PORT_MIN` | `20000` | Start of RTP port range |
| `RECORDING_RTP_PORT_MAX` | `20200` | End of RTP port range |
| `MEDIASOUP_LISTEN_IP` | `0.0.0.0` | IP mediasoup workers bind to |
| `MEDIASOUP_ANNOUNCED_IP` | `127.0.0.1` | Public IP sent in ICE candidates |
| `BULL_CONCURRENCY` | `5` | Parallel submission processing jobs |
| `REDIS_HOST` | — | Redis connection for queues, rate limiting, leaderboard |
| `REDIS_PORT` | `6379` | Redis port |
| `JUDGE0_URL` | — | Base URL of Judge0 service |
| `JUDGE0_API_KEY` | — | API key for Judge0 (if auth enabled) |

---

## 4. Cross-Module Integration Points

**CodeArena → Judge0**
Every run and submission goes through Judge0. Code is base64-encoded before sending and decoded on receipt. The queue processor fans out one Judge0 request per test case, collects all tokens, then polls them concurrently.

**CodeArena Submissions → Leaderboard**
When a submission processor determines `verdict = ACCEPTED` for the first time for a user+problem pair (checked via `CaSubmissionSummary.isSolved`), it calls `leaderboardService.updateGlobalLeaderboard()` which performs a Redis `ZADD` on `leaderboard:global`.

**Interview → Mediasoup → Recording**
The socket event `produce` is the trigger for recording. The socket handler calls `addProducerToRecording()` immediately after creating the mediasoup producer, so recording captures streams from the moment they start — not from when the recruiter pressed "Record". FFmpeg only spawns once both audio and video are present.

**Interview end → Recording stop**
The `interview-ended` socket event calls `stopRecording()` as part of its handler, ensuring the recording is always finalized even if the recruiter forgets to press "Stop Recording" first.

**Recording → Timestamps**
`RecordingTimestamp.offsetMs` is calculated on the client as `Date.now() - recordingStartedAt`. This means timestamps are tied to the recording timeline, not wall-clock time, so they remain accurate if the download is played back independently.

**Shared submission queue**
Both CodeArena standalone problems and contest problems use the same Bull queue (`codearena:submissions`). The job payload includes an `isContestSubmission` boolean and an optional `contestId`. The processor handles both cases but additionally updates the contest leaderboard score formula (§1.7) when `isContestSubmission = true`.
