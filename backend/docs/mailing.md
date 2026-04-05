# 📬 CodeNexus Internal Mail System

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [CNID System](#cnid-system)
4. [Permission Matrix](#permission-matrix)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Message Flow](#message-flow)
8. [Threading System](#threading-system)
9. [Real-Time Notifications](#real-time-notifications)
10. [Security Features](#security-features)
11. [Rate Limiting](#rate-limiting)
12. [Content Sanitization](#content-sanitization)
13. [Caching Strategy](#caching-strategy)
14. [Frontend Integration](#frontend-integration)

---

## Overview

The CodeNexus Internal Mail System is a self-contained messaging module that enables secure, role-restricted communication between the four user types without exposing any external email addresses. All addressing is done through CodeNexus IDs (CNIDs).

### Key Characteristics

- **No External Email**: All communication stays within CodeNexus
- **CNID-Based Addressing**: Users are identified by unique CNIDs instead of emails
- **Role-Restricted**: Communication paths are strictly governed by user roles
- **Thread-Based**: Messages support threaded conversations
- **Real-Time**: SSE notifications for instant delivery
- **Soft Delete**: Both sender and recipient must independently delete messages

---

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Clients
        Student["👤 Student"]
        University["🏛️ University"]
        Company["🏢 Company"]
        Recruiter["👔 Recruiter"]
    end

    subgraph "API Layer"
        API["Express API<br/>/api/v1/mail/*"]
    end

    subgraph Data
        DB["🐘 PostgreSQL<br/>Mail Table"]
        Cache["⚡ In-Memory Cache<br/>Unread Count"]
        SSE["📡 SSE Stream<br/>Real-Time"]
    end

    Student & University & Company & Recruiter --> API
    API --> DB
    API --> Cache
    API --> SSE

    style API fill:#1a1a2e,stroke:#06b6d4,color:#fff
    style DB fill:#1a1a2e,stroke:#4169E1,color:#fff
    style Cache fill:#1a1a2e,stroke:#DC382D,color:#fff
    style SSE fill:#1a1a2e,stroke:#22c55e,color:#fff
```

### Component Diagram

```mermaid
graph LR
    Client["🌐 Client"] --> Controller["📝 Controller<br/>Routes"]
    Controller --> Service["⚙️ Service<br/>Business Logic"]
    
    Service --> Permission["🔐 Permission<br/>Matrix"]
    Service --> Sanitizer["🧹 Sanitizer<br/>Content"]
    Service --> RateLimiter["⏱️ Rate<br/>Limiter"]
    Service --> SSE["📡 SSE<br/>Manager"]

    Service --> DB["🐘 Database"]
    Service --> Cache["⚡ Cache"]
```

---

## CNID System

### Format

```
CN-{PREFIX}-{6 RANDOM CHARS}
```

### Prefix Mapping

| Role | Prefix | Example CNID |
|------|--------|--------------|
| Student | STU | `CN-STU-A1B2C3` |
| University | UNI | `CN-UNI-X7Y8Z9` |
| Company | COM | `CN-COM-M4N5O6` |
| Recruiter | REC | `CN-REC-P1Q2R3` |

### CNID Generation Flow

```mermaid
flowchart TD
    A["User Registers"] --> B["Get User Role (R)"]
    B --> C["prefix = PREFIX_MAP[R]"]
    C --> D["random = 6 alphanumeric chars"]
    D --> E["cnid = CN-{prefix}-{random}"]
    E --> F{"Check uniqueness<br/>in database"}
    F -->|Unique| G["Assign to User"]
    F -->|Duplicate| H["Retry (max 5)"]
    H --> D
```

### Implementation

```typescript
// src/utils/cnid.ts
const PREFIX_MAP = {
    STUDENT: "STU",
    UNIVERSITY: "UNI",
    COMPANY_ADMIN: "COM",
    RECRUITER: "REC",
};

export function generateCnid(role: Role): string {
    const prefix = PREFIX_MAP[role];
    const randomPart = generateRandomString();
    return `CN-${prefix}-${randomPart}`;
}

export async function generateUniqueCnid(role: Role): Promise<string> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        const cnid = generateCnid(role);
        const existing = await prisma.user.findUnique({ where: { cnid } });
        if (!existing) return cnid;
        retries++;
    }
    throw new Error("Failed to generate unique CNID");
}
```

---

## Permission Matrix

### Communication Rules

| From \ To | Student | University | Company | Recruiter |
|-----------|---------|------------|---------|-----------|
| **Student** | ❌ | ✅ | ❌ | ❌ |
| **University** | ✅ | ❌ | ✅ | ❌ |
| **Company** | ✅ | ✅ | ❌ | ✅ |
| **Recruiter** | ❌ | ❌ | ✅ | ❌ |

### Matrix Implementation

```typescript
// src/utils/permission-matrix.ts
const PERMISSION_MATRIX: Record<Role, Role[]> = {
    STUDENT: ["UNIVERSITY"],
    UNIVERSITY: ["STUDENT", "COMPANY_ADMIN"],
    COMPANY_ADMIN: ["STUDENT", "UNIVERSITY", "RECRUITER"],
    RECRUITER: ["COMPANY_ADMIN"],
};

export function canSendMail(senderRole: Role, recipientRole: Role): boolean {
    const allowedRecipients = PERMISSION_MATRIX[senderRole];
    return allowedRecipients?.includes(recipientRole) ?? false;
}
```

### Validation Flow

```mermaid
flowchart TD
    Start["Request:<br/>sender_cnid, recipient_cnid,<br/>subject, body"] --> Parse["Parse sender CNID<br/>Get sender role"]
    Parse --> ParseR["Parse recipient CNID<br/>Get recipient role"]
    ParseR --> Check["Check: canSendMail<br/>senderRole, recipientRole"]
    Check --> Decision{"Allowed?"}
    Decision -->|Yes| Proceed["Proceed to send mail"]
    Decision -->|No| Denied["Return 403 Forbidden<br/>Log violation"]
```

---

## Database Schema

### Mail Table

```sql
CREATE TABLE "Mail" (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_cnid           VARCHAR(20) NOT NULL,
    recipient_cnid        VARCHAR(20) NOT NULL,
    subject               VARCHAR(200) NOT NULL,
    body                  TEXT NOT NULL,
    sent_at               TIMESTAMP DEFAULT NOW(),
    is_read               BOOLEAN DEFAULT FALSE,
    is_deleted_sender     BOOLEAN DEFAULT FALSE,
    is_deleted_recipient  BOOLEAN DEFAULT FALSE,
    thread_id             UUID NOT NULL,
    parent_mail_id        UUID REFERENCES "Mail"(id),
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);
```

### ER Diagram

```mermaid
erDiagram
    User {
        string id PK
        string cnid UK
        string email
        string role
    }

    Mail {
        string id PK
        string sender_cnid
        string recipient_cnid
        string subject
        string body
        datetime sent_at
        boolean is_read
        boolean is_deleted_sender
        boolean is_deleted_recipient
        string thread_id
        string parent_mail_id FK
    }

    MailPermissionViolation {
        string id PK
        string sender_cnid
        string attempted_recipient_cnid
        string action
        datetime timestamp
        string ip_address
        string user_agent
    }

    User ||--o{ Mail : "sentMails"
    User ||--o{ Mail : "receivedMails"
    Mail ||--o| Mail : "parent"
    Mail ||--o{ Mail : "replies"
```

### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `idx_mails_recipient` | `recipient_cnid, is_read, is_deleted_recipient` | Fast inbox queries |
| `idx_mails_sender` | `sender_cnid, is_deleted_sender` | Fast sent box queries |
| `idx_mails_thread` | `thread_id` | Fast thread loading |

---

## API Endpoints

### Endpoint Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/mail/send` | Send a new mail |
| `GET` | `/api/v1/mail/inbox` | Get inbox (paginated) |
| `GET` | `/api/v1/mail/sent` | Get sent box |
| `GET` | `/api/v1/mail/:id` | Get single mail |
| `GET` | `/api/v1/mail/thread/:thread_id` | Get full thread |
| `PATCH` | `/api/v1/mail/:id/read` | Mark as read |
| `DELETE` | `/api/v1/mail/:id` | Delete mail |
| `GET` | `/api/v1/mail/unread-count` | Get unread count |
| `GET` | `/api/v1/mail/search-recipients` | Search recipients |
| `GET` | `/api/v1/mail/events` | SSE notification stream |

### 1. Send Mail

```http
POST /api/v1/mail/send
Authorization: Bearer <token>
Content-Type: application/json

{
    "recipient_cnid": "CN-UNI-X7Y8Z9",
    "subject": "Placement Drive 2026",
    "body": "Dear students, the placement drive is scheduled for...",
    "parent_mail_id": "uuid-optional"
}
```

**Response (201 Created):**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "sender_cnid": "CN-STU-A1B2C3",
        "recipient_cnid": "CN-UNI-X7Y8Z9",
        "subject": "Placement Drive 2026",
        "body": "Dear students, the placement drive is scheduled for...",
        "sent_at": "2026-04-05T10:30:00Z",
        "is_read": false,
        "thread_id": "uuid",
        "parent_mail_id": null
    },
    "message": "Mail sent successfully"
}
```

### 2. Get Inbox

```http
GET /api/v1/mail/inbox?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
    "success": true,
    "data": {
        "mails": [
            {
                "id": "uuid",
                "sender_cnid": "CN-UNI-X7Y8Z9",
                "sender_name": "IIT Delhi Placement Cell",
                "subject": "Placement Drive 2026",
                "sent_at": "2026-04-05T10:30:00Z",
                "is_read": false,
                "thread_id": "uuid"
            }
        ],
        "total": 15,
        "page": 1,
        "limit": 20
    },
    "message": "Inbox fetched successfully"
}
```

### 3. Get Sent Box

```http
GET /api/v1/mail/sent?page=1&limit=20
Authorization: Bearer <token>
```

### 4. Get Single Mail

```http
GET /api/v1/mail/:id
Authorization: Bearer <token>
```

**Side Effect:** If the current user is the recipient and `is_read` is `false`, automatically marks as read.

### 5. Get Thread

```http
GET /api/v1/mail/thread/:thread_id
Authorization: Bearer <token>
```

**Response:** Array of all mails in the thread, ordered by `sent_at` ASC.

### 6. Mark as Read

```http
PATCH /api/v1/mail/:id/read
Authorization: Bearer <token>
```

### 7. Delete Mail

```http
DELETE /api/v1/mail/:id
Authorization: Bearer <token>
```

| Condition | Action |
|-----------|--------|
| User is sender | Sets `is_deleted_sender = true` |
| User is recipient | Sets `is_deleted_recipient = true` |
| Both deleted | Mail is truly deleted |

### 8. Get Unread Count

```http
GET /api/v1/mail/unread-count
Authorization: Bearer <token>
```

**Response:**

```json
{
    "success": true,
    "data": { "unread_count": 5 },
    "message": "Unread count fetched successfully"
}
```

### 9. Search Recipients

```http
GET /api/v1/mail/search-recipients?q=student
Authorization: Bearer <token>
```

**Response:**

```json
{
    "success": true,
    "data": [
        { "cnid": "CN-STU-A1B2C3", "displayName": "John Doe", "role": "student" },
        { "cnid": "CN-STU-D4E5F6", "displayName": "Jane Smith", "role": "student" }
    ],
    "message": "Recipients found"
}
```

### 10. SSE Events Stream

```http
GET /api/v1/mail/events
Authorization: Bearer <token>
```

**Event Format:**

```
event: new_mail
data: {"type":"new_mail","sender_name":"IIT Delhi","sender_cnid":"CN-UNI-X7Y8Z9","subject":"Update","thread_id":"uuid","mail_id":"uuid","sent_at":"2026-04-05T10:30:00Z"}
```

---

## Message Flow

### Send Message Sequence

```mermaid
sequenceDiagram
    participant Client
    participant API as API Server
    participant DB as Database
    participant Cache
    participant SSE

    Client->>API: POST /mail/send
    API->>API: Validate CNID format
    API->>DB: Lookup recipient by cnid
    DB-->>API: User found
    API->>API: Check permission matrix
    API->>API: Check rate limit
    API->>API: Sanitize body content
    API->>DB: INSERT mail
    DB-->>API: Mail created
    API->>Cache: Invalidate unread:{recipientCnid}
    API->>SSE: emitNewMailEvent
    SSE-->>Client: new_mail event
    API-->>Client: 201 Created
```

---

## Threading System

### Thread Model

```mermaid
flowchart TB
    subgraph "Thread ID: 550e8400-e29b-41d4-a716-446655440000"
        M1["📧 Mail #1 (Original)<br/>sender: CN-STU-A1B2C3<br/>recipient: CN-UNI-X7Y8Z9<br/>subject: Placement Drive Inquiry<br/>parent_mail_id: null"]
        
        M2["📧 Mail #2 (Reply)<br/>sender: CN-UNI-X7Y8Z9<br/>recipient: CN-STU-A1B2C3<br/>subject: Re: Placement Drive Inquiry<br/>parent_mail_id: M1"]
        
        M3["📧 Mail #3 (Reply)<br/>sender: CN-STU-A1B2C3<br/>recipient: CN-UNI-X7Y8Z9<br/>subject: Re: Placement Drive Inquiry<br/>parent_mail_id: M2"]
    end

    M1 -->|Reply| M2
    M2 -->|Reply| M3
```

### Thread Retrieval

```json
GET /api/v1/mail/thread/550e8400-e29b-41d4-a716-446655440000

Response: [
    {
        "id": "uuid-1",
        "sender_cnid": "CN-STU-A1B2C3",
        "sender_name": "John Doe",
        "recipient_cnid": "CN-UNI-X7Y8Z9",
        "recipient_name": "IIT Delhi",
        "subject": "Placement Drive Inquiry",
        "sent_at": "2026-04-05T10:00:00Z",
        "is_read": true,
        "thread_id": "550e8400-...",
        "parent_mail_id": null
    },
    {
        "id": "uuid-2",
        "sender_cnid": "CN-UNI-X7Y8Z9",
        "sender_name": "IIT Delhi",
        "recipient_cnid": "CN-STU-A1B2C3",
        "recipient_name": "John Doe",
        "subject": "Re: Placement Drive Inquiry",
        "sent_at": "2026-04-05T11:00:00Z",
        "is_read": true,
        "thread_id": "550e8400-...",
        "parent_mail_id": "uuid-1"
    },
    {
        "id": "uuid-3",
        "sender_cnid": "CN-STU-A1B2C3",
        "sender_name": "John Doe",
        "recipient_cnid": "CN-UNI-X7Y8Z9",
        "recipient_name": "IIT Delhi",
        "subject": "Re: Placement Drive Inquiry",
        "sent_at": "2026-04-05T12:00:00Z",
        "is_read": false,
        "thread_id": "550e8400-...",
        "parent_mail_id": "uuid-2"
    }
]
```

---

## Real-Time Notifications

### SSE Architecture

```mermaid
flowchart TB
    subgraph SSE["📡 SSE Manager (Singleton)"]
        Manager["SSEManager<br/>clients: Map<cnid, Response[]>"]
    end

    subgraph Clients
        C1["👤 Client 1<br/>CN-STU-A1B2C3"]
        C2["🏛️ Client 2<br/>CN-UNI-X7Y8Z9"]
        C3["🏢 Client N<br/>CN-COM-M4N5O6"]
    end

    C1 -->|GET /events| Manager
    C2 -->|GET /events| Manager
    C3 -->|GET /events| Manager

    Manager -->|new_mail event| C1
    Manager -->|new_mail event| C2
    Manager -->|new_mail event| C3
```

### SSE Flow

```mermaid
sequenceDiagram
    participant Client
    participant SSE as SSE Manager
    participant Mail as Mail Service

    Mail->>SSE: emitNewMailEvent(recipientCnid, data)
    SSE->>SSE: Find clients for recipientCnid
    SSE->>Client: Write to response stream
    Note over Client: Event: new_mail<br/>Data: {...}
```

### Implementation

```typescript
// src/modules/mail/mail.sse.ts
class SSEManager {
    private clients = new Map<string, Response[]>();

    addClient(cnid: string, res: Response): void { ... }
    removeClient(cnid: string, res: Response): void { ... }
    sendToUser(cnid: string, event: string, data: unknown): void { ... }
}

export function emitNewMailEvent(
    recipientCnid: string,
    senderName: string,
    senderCnid: string,
    subject: string,
    threadId: string,
    mailId: string
): void {
    const event = {
        type: "new_mail",
        sender_name: senderName,
        sender_cnid: senderCnid,
        subject,
        thread_id: threadId,
        mail_id: mailId,
        sent_at: new Date().toISOString(),
    };
    sseManager.sendToUser(recipientCnid, "new_mail", event);
}
```

### Client-Side Usage

```typescript
// Frontend example
useEffect(() => {
    const eventSource = new EventSource('/api/v1/mail/events', {
        headers: { Authorization: `Bearer ${token}` }
    });

    eventSource.addEventListener('new_mail', (event) => {
        const data = JSON.parse(event.data);
        setUnreadCount(prev => prev + 1);
        showNotification(`New mail from ${data.sender_name}: ${data.subject}`);
    });

    eventSource.addEventListener('connected', () => {
        console.log('SSE connected');
    });

    return () => eventSource.close();
}, []);
```

---

## Security Features

### Security Layers

```mermaid
flowchart TB
    subgraph L1["Layer 1: Authentication"]
        A["JWT Token Validation<br/>• Verify signature<br/>• Check expiration<br/>• Extract cnid & role"]
    end

    subgraph L2["Layer 2: Authorization"]
        P["Permission Matrix Check<br/>• Validate role pair<br/>• 403 if denied<br/>• Log violations"]
    end

    subgraph L3["Layer 3: Content Sanitization"]
        S["Input Sanitization<br/>• Strip HTML tags<br/>• Validate URLs<br/>• Enforce max lengths"]
    end

    subgraph L4["Layer 4: Rate Limiting"]
        R["Throttling<br/>• 20 mails/hour<br/>• 30 searches/minute"]
    end

    L1 --> L2 --> L3 --> L4
```

### Permission Violation Logging

```typescript
// Logged on every 403 response
await prisma.mailPermissionViolation.create({
    data: {
        sender_cnid: senderCnid,
        attempted_recipient_cnid: recipientCnid,
        action: "send_mail",
        ip_address: req.ip,
        user_agent: req.get("user-agent"),
    },
});
```

---

## Rate Limiting

### Rate Limit Rules

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /mail/send` | 20 requests | 1 hour |
| `GET /mail/search-recipients` | 30 requests | 1 minute |

### Implementation

```typescript
// In mail.service.ts
const SEND_RATE_LIMIT = 20;
const SEND_RATE_WINDOW_MS = 60 * 60 * 1000;

async function checkSendRateLimit(senderCnid: string): Promise<void> {
    const windowStart = new Date(Date.now() - SEND_RATE_WINDOW_MS);
    const recentMails = await prisma.mail.count({
        where: {
            sender_cnid: senderCnid,
            sent_at: { gte: windowStart },
        },
    });

    if (recentMails >= SEND_RATE_LIMIT) {
        throw new ApiError(429, `Rate limit exceeded. Max ${SEND_RATE_LIMIT} mails/hour.`);
    }
}
```

---

## Content Sanitization

### Allowed Content

| Type | Example |
|------|---------|
| Plain Text | `Hello, please check the following link` |
| URLs (auto-linkified) | `Visit https://example.com for more info` |
| Max subject length | 200 characters |
| Max body length | 5000 characters |

### Blocked Content

| Type | Example |
|------|---------|
| HTML Tags | `<script>alert('xss')</script>`, `<b>bold</b>` |
| Angle brackets (non-URL) | `Array<string>` → Blocked |
| File attachments | Not supported |
| Images | Not supported |
| Rich text | Not supported |

### Sanitization Algorithm

```mermaid
flowchart TD
    A["Input: rawBody"] --> B["Extract URLs using regex"]
    B --> C{"HTML tags<br/>detected?"}
    C -->|Yes| Reject1["REJECT:<br/>HTML tags not allowed"]
    C -->|No| D["Check angle brackets<br/>outside URLs"]
    D --> E{"Suspicious<br/>brackets?"}
    E -->|Yes| Reject2["REJECT:<br/>Angle brackets detected"]
    E -->|No| F["Strip remaining HTML"]
    F --> G{"Length<br/>> 5000?"}
    G -->|Yes| Reject3["REJECT:<br/>Body too long"]
    G -->|No| H["Return sanitized content"]
```

---

## Caching Strategy

### Unread Count Cache

```mermaid
flowchart TD
    Start["Get Unread Count"] --> Check["Check cache key<br/>unread:{cnid}"]
    Check --> Hit{"Cache<br/>Hit?"}
    Hit -->|Yes| Return["Return cached value"]
    Hit -->|No| Query["Query DB count"]
    Query --> Store["Store in cache<br/>TTL: 10 seconds"]
    Store --> Return

    Return2["Return count"] --> End["End"]
    Return --> End
```

### Cache Invalidation Events

| Event | Action |
|-------|--------|
| Mail sent to user | Invalidate `unread:{userCnid}` |
| Mail marked as read | Invalidate `unread:{userCnid}` |
| Mail deleted | Invalidate `unread:{userCnid}` |

### Cache Implementation

```typescript
// src/lib/cache.ts
class InMemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private readonly defaultTTL = 10000;

    set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T>;
        if (!entry || Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }
}

export const unreadCountCache = new InMemoryCache();
```

---

## Frontend Integration

### Mail Module Structure

```
frontend/src/pages/
└── mail/
    ├── MailBox.tsx           # Main mail component
    ├── Inbox.tsx             # Inbox list view
    ├── Sent.tsx              # Sent box view
    ├── Thread.tsx            # Thread view
    ├── Compose.tsx           # New mail composer
    ├── MailItem.tsx          # Individual mail row
    └── RecipientSearch.tsx   # Autocomplete search
```

### API Integration Example

```typescript
// services/mail.service.ts
const API_BASE = '/api/v1/mail';

export const mailApi = {
    send: async (data: SendMailInput) => {
        const res = await api.post(`${API_BASE}/send`, data);
        return res.data;
    },

    inbox: async (page = 1, limit = 20) => {
        const res = await api.get(`${API_BASE}/inbox`, {
            params: { page, limit }
        });
        return res.data;
    },

    getThread: async (threadId: string) => {
        const res = await api.get(`${API_BASE}/thread/${threadId}`);
        return res.data;
    },

    searchRecipients: async (query: string) => {
        const res = await api.get(`${API_BASE}/search-recipients`, {
            params: { q: query }
        });
        return res.data;
    },

    subscribeToEvents: (onMessage: (event: MailEvent) => void) => {
        const eventSource = new EventSource(`${API_BASE}/events`, {
            withCredentials: true
        });

        eventSource.addEventListener('new_mail', (e) => {
            onMessage(JSON.parse(e.data));
        });

        return () => eventSource.close();
    }
};
```

### URL Linkification

```typescript
// Use a safe library like 'linkify-it'
// NEVER use dangerouslySetInnerHTML with raw content

import LinkifyIt from 'linkify-it';

const linkify = new LinkifyIt();

export function linkifyContent(text: string): string {
    const tokens = linkify.tokenize(text);

    if (!tokens.length) return escapeHtml(text);

    let result = '';
    for (const token of tokens) {
        if (token.type === 'url') {
            result += `<a href="${token.url}" target="_blank" rel="noopener noreferrer">${token.url}</a>`;
        } else {
            result += escapeHtml(token.text);
        }
    }
    return result;
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

---

## Database Migration

### Run Migration

```bash
# Apply the mail system migration
psql $DATABASE_URL < backend/prisma/migrations/001_mail_system.sql

# Or use Prisma migrate
cd backend
npx prisma migrate dev --name add_mail_system
```

### Migration Contents

```sql
-- 1. Add CNID to users
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS cnid VARCHAR(20) UNIQUE;

-- 2. Create Mail table
CREATE TABLE "Mail" (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_cnid           VARCHAR(20) NOT NULL,
    recipient_cnid        VARCHAR(20) NOT NULL,
    subject               VARCHAR(200) NOT NULL,
    body                  TEXT NOT NULL,
    sent_at               TIMESTAMP DEFAULT NOW(),
    is_read               BOOLEAN DEFAULT FALSE,
    is_deleted_sender     BOOLEAN DEFAULT FALSE,
    is_deleted_recipient  BOOLEAN DEFAULT FALSE,
    thread_id             UUID NOT NULL,
    parent_mail_id        UUID REFERENCES "Mail"(id),
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX idx_mails_recipient ON "Mail"(recipient_cnid, is_read, is_deleted_recipient);
CREATE INDEX idx_mails_sender ON "Mail"(sender_cnid, is_deleted_sender);
CREATE INDEX idx_mails_thread ON "Mail"(thread_id);

-- 4. Create permission violation log
CREATE TABLE "MailPermissionViolation" (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_cnid              VARCHAR(20) NOT NULL,
    attempted_recipient_cnid VARCHAR(20) NOT NULL,
    action                   VARCHAR(50) NOT NULL,
    timestamp                TIMESTAMP DEFAULT NOW(),
    ip_address               VARCHAR(45),
    user_agent               TEXT
);

CREATE INDEX idx_permission_violations_sender ON "MailPermissionViolation"(sender_cnid, timestamp);
CREATE INDEX idx_permission_violations_time ON "MailPermissionViolation"(timestamp);
```

---

## Error Handling

### Error Responses

| Status | Scenario | Response |
|--------|----------|----------|
| 400 | Invalid input | `{ "success": false, "message": "Validation error details" }` |
| 401 | No/Invalid token | `{ "success": false, "message": "Unauthorized" }` |
| 403 | Permission denied | `{ "success": false, "message": "Your role cannot send to this recipient" }` |
| 404 | Mail/User not found | `{ "success": false, "message": "Mail not found" }` |
| 429 | Rate limited | `{ "success": false, "message": "Rate limit exceeded..." }` |
| 500 | Server error | `{ "success": false, "message": "Internal server error" }` |

---

## Configuration

### Environment Variables

```env
# Required for mail system
DATABASE_URL=postgresql://user:pass@host:5432/db

# Optional - for scaling SSE
REDIS_URL=redis://localhost:6379
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SEND_RATE_LIMIT` | 20 | mails per hour |
| `SEND_RATE_WINDOW_MS` | 3600000 | 1 hour in ms |
| `SEARCH_RATE_LIMIT` | 30 | searches per minute |
| `SEARCH_RATE_WINDOW_MS` | 60000 | 1 minute in ms |
| `UNREAD_CACHE_TTL` | 10000 | 10 seconds |
| `MAX_BODY_LENGTH` | 5000 | characters |
| `MAX_SUBJECT_LENGTH` | 200 | characters |
