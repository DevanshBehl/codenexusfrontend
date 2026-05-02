import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('fs', () => ({
    default: { existsSync: vi.fn().mockReturnValue(true) },
    existsSync: vi.fn().mockReturnValue(true),
}));

vi.mock('../../../lib/prisma.js', () => ({
    prisma: {
        company: { findUnique: vi.fn() },
        recruiter: { findUnique: vi.fn(), findMany: vi.fn() },
        student: { findUnique: vi.fn(), findMany: vi.fn() },
        interview: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
        recording: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
        interviewRecording: { findUnique: vi.fn() },
        companyUniversity: { findMany: vi.fn() },
        interviewMessage: { findMany: vi.fn() },
        recordingTimestamp: { findMany: vi.fn() },
    },
}));

vi.mock('../../../lib/recording.manager.js', () => ({
    getRecordingStatus: vi.fn(),
    stopRecording: vi.fn(),
}));

import { prisma } from '../../../lib/prisma.js';
import { stopRecording, getRecordingStatus } from '../../../lib/recording.manager.js';
import {
    scheduleInterview,
    getInterviewById,
    updateInterview,
    deleteInterview,
    joinInterview,
    getStudentsForScheduling,
    getCompanyRecruiters,
    getServerRecordingStatus,
    downloadServerRecording,
    getMessages,
} from '../interview.service.js';

const mockPrisma = prisma as any;
const mockStop = stopRecording as any;
const mockGetStatus = getRecordingStatus as any;

const fakeRecruiter = { id: 'rec-1', userId: 'user-recruiter', companyId: 'company-1', name: 'Jane' };
const fakeCompany = { id: 'company-1', userId: 'user-admin', name: 'Acme' };
const fakeStudent = { id: 'stu-1', userId: 'user-student', name: 'Bob', branch: 'CS', cgpa: 8.5 };
const fakeInterview = {
    id: 'iv-1',
    recruiterId: 'rec-1',
    studentId: 'stu-1',
    role: 'Backend Engineer',
    scheduledAt: new Date('2025-08-10T10:00:00'),
    type: 'TECHNICAL',
    status: 'SCHEDULED',
    recruiter: fakeRecruiter,
    student: { ...fakeStudent, userId: 'user-student' },
    recording: null,
    interviewRecording: null,
};

const scheduleInput = {
    studentId: 'stu-1',
    role: 'Backend Engineer',
    scheduledDate: '2025-08-10',
    scheduledTime: '10:00',
    type: 'TECHNICAL' as const,
};

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── scheduleInterview ────────────────────────────────────────────────────────

describe('scheduleInterview', () => {
    it('schedules an interview as a RECRUITER', async () => {
        mockPrisma.recruiter.findUnique.mockResolvedValue(fakeRecruiter);
        mockPrisma.interview.create.mockResolvedValue(fakeInterview);

        const result = await scheduleInterview('user-recruiter', 'RECRUITER', scheduleInput);

        expect(mockPrisma.interview.create).toHaveBeenCalledOnce();
        expect(result.id).toBe('iv-1');
    });

    it('schedules an interview as a COMPANY_ADMIN when a recruiterId is provided', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.recruiter.findUnique.mockResolvedValue(fakeRecruiter);
        mockPrisma.interview.create.mockResolvedValue(fakeInterview);

        const result = await scheduleInterview('user-admin', 'COMPANY_ADMIN', {
            ...scheduleInput,
            recruiterId: 'rec-1',
        });

        expect(result.id).toBe('iv-1');
    });

    it('throws 400 when COMPANY_ADMIN does not supply a recruiterId', async () => {
        await expect(
            scheduleInterview('user-admin', 'COMPANY_ADMIN', scheduleInput)
        ).rejects.toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('throws 403 when an unauthorized role tries to schedule', async () => {
        await expect(
            scheduleInterview('user-student', 'STUDENT', scheduleInput)
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 403 when recruiter profile is not found', async () => {
        mockPrisma.recruiter.findUnique.mockResolvedValue(null);

        await expect(
            scheduleInterview('user-recruiter', 'RECRUITER', scheduleInput)
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 403 when recruiter does not belong to the company', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        // Recruiter belongs to a different company
        mockPrisma.recruiter.findUnique.mockResolvedValue({ ...fakeRecruiter, companyId: 'other-company' });

        await expect(
            scheduleInterview('user-admin', 'COMPANY_ADMIN', { ...scheduleInput, recruiterId: 'rec-1' })
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });
});

// ─── getInterviewById ─────────────────────────────────────────────────────────

describe('getInterviewById', () => {
    it('returns the interview when it exists', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview);

        const result = await getInterviewById('iv-1');

        expect(result.id).toBe('iv-1');
    });

    it('throws 404 when the interview does not exist', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(null);

        await expect(getInterviewById('missing')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── updateInterview ──────────────────────────────────────────────────────────

describe('updateInterview', () => {
    it('updates the interview when the recruiter is the owner', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview);
        mockPrisma.recruiter.findUnique.mockResolvedValue(fakeRecruiter);
        mockPrisma.interview.update.mockResolvedValue({ ...fakeInterview, status: 'COMPLETED' });

        const result = await updateInterview('user-recruiter', 'RECRUITER', 'iv-1', { status: 'COMPLETED' });

        expect(result.status).toBe('COMPLETED');
    });

    it('throws 403 when a recruiter tries to update another recruiter\'s interview', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview); // recruiterId = rec-1
        mockPrisma.recruiter.findUnique.mockResolvedValue({ ...fakeRecruiter, id: 'rec-other' });

        await expect(
            updateInterview('user-recruiter2', 'RECRUITER', 'iv-1', {})
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 404 when the interview does not exist', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(null);

        await expect(updateInterview('u', 'RECRUITER', 'bad-id', {})).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── deleteInterview ──────────────────────────────────────────────────────────

describe('deleteInterview', () => {
    it('deletes the interview when the recruiter is the owner', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview);
        mockPrisma.recruiter.findUnique.mockResolvedValue(fakeRecruiter);
        mockPrisma.interview.delete.mockResolvedValue(fakeInterview);

        const result = await deleteInterview('user-recruiter', 'RECRUITER', 'iv-1');

        expect(result).toEqual({ success: true });
        expect(mockPrisma.interview.delete).toHaveBeenCalledWith({ where: { id: 'iv-1' } });
    });

    it('throws 403 when a recruiter tries to delete another recruiter\'s interview', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview);
        mockPrisma.recruiter.findUnique.mockResolvedValue({ ...fakeRecruiter, id: 'rec-other' });

        await expect(
            deleteInterview('user-other', 'RECRUITER', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
        expect(mockPrisma.interview.delete).not.toHaveBeenCalled();
    });
});

// ─── joinInterview ────────────────────────────────────────────────────────────

describe('joinInterview', () => {
    it('allows the scheduled student to join', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview);

        const result = await joinInterview('user-student', 'STUDENT', 'iv-1');

        expect(result).toEqual({ success: true });
    });

    it('allows the assigned recruiter to join', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue({
            ...fakeInterview,
            recruiter: { ...fakeRecruiter, userId: 'user-recruiter' },
        });

        const result = await joinInterview('user-recruiter', 'RECRUITER', 'iv-1');

        expect(result).toEqual({ success: true });
    });

    it('throws 403 when a different student tries to join', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fakeInterview);

        await expect(
            joinInterview('user-intruder', 'STUDENT', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 404 when the interview does not exist', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(null);

        await expect(joinInterview('u', 'STUDENT', 'bad-id')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── getStudentsForScheduling ─────────────────────────────────────────────────

describe('getStudentsForScheduling', () => {
    it('returns available students from approved universities for COMPANY_ADMIN', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.companyUniversity.findMany.mockResolvedValue([
            { universityId: 'uni-1' },
            { universityId: 'uni-2' },
        ]);
        mockPrisma.student.findMany.mockResolvedValue([fakeStudent]);

        const result = await getStudentsForScheduling('user-admin', 'COMPANY_ADMIN');

        expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    status: 'AVAILABLE',
                    universityId: { in: ['uni-1', 'uni-2'] },
                }),
            })
        );
        expect(result).toHaveLength(1);
    });

    it('throws 403 when a student tries to access scheduling data', async () => {
        await expect(
            getStudentsForScheduling('user-student', 'STUDENT')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });
});

// ─── getCompanyRecruiters ─────────────────────────────────────────────────────

describe('getCompanyRecruiters', () => {
    it('returns all recruiters belonging to the company', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.recruiter.findMany.mockResolvedValue([fakeRecruiter]);

        const result = await getCompanyRecruiters('user-admin');

        expect(mockPrisma.recruiter.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { companyId: 'company-1' } })
        );
        expect(result).toHaveLength(1);
    });

    it('throws 404 when the company profile does not exist', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(null);

        await expect(getCompanyRecruiters('no-company-user')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── getServerRecordingStatus ─────────────────────────────────────────────────

describe('getServerRecordingStatus', () => {
    const fullInterview = {
        ...fakeInterview,
        recruiter: { ...fakeRecruiter, userId: 'user-recruiter', user: { id: 'user-recruiter' } },
        student: { ...fakeStudent, userId: 'user-student', user: { id: 'user-student' } },
    };

    it('returns recording status for an authorized recruiter', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);
        mockGetStatus.mockResolvedValue({ status: 'recording', started_at: new Date() });

        const result = await getServerRecordingStatus('user-recruiter', 'RECRUITER', 'iv-1');

        expect(result.status).toBe('recording');
    });

    it('throws 403 when a student tries to access server recording status', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);

        await expect(
            getServerRecordingStatus('user-student', 'STUDENT', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 403 when an unauthorized user requests recording status', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);

        await expect(
            getServerRecordingStatus('user-intruder', 'RECRUITER', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 404 when the interview does not exist', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(null);

        await expect(
            getServerRecordingStatus('u', 'RECRUITER', 'bad-id')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 404 }));
    });
});

// ─── downloadServerRecording ──────────────────────────────────────────────────

describe('downloadServerRecording', () => {
    const fullInterview = {
        ...fakeInterview,
        recruiter: { ...fakeRecruiter, userId: 'user-recruiter', user: { id: 'user-recruiter' } },
        student: { ...fakeStudent, userId: 'user-student', user: { id: 'user-student' } },
    };

    it('returns file path info for an authorized recruiter when recording is ready', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);
        mockPrisma.interviewRecording.findUnique.mockResolvedValue({
            status: 'completed',
            file_path: '/recordings/iv-1/output.mp4',
            file_size_bytes: BigInt(1024),
        });

        const result = await downloadServerRecording('user-recruiter', 'RECRUITER', 'iv-1');

        expect(result.filePath).toBe('/recordings/iv-1/output.mp4');
        expect(result.fileName).toMatch(/^interview-iv-1-/);
    });

    it('throws 400 when recording is not yet complete', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);
        mockPrisma.interviewRecording.findUnique.mockResolvedValue({
            status: 'recording',
            file_path: null,
            file_size_bytes: null,
        });

        await expect(
            downloadServerRecording('user-recruiter', 'RECRUITER', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('throws 403 when a student tries to download', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);

        await expect(
            downloadServerRecording('user-student', 'STUDENT', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 404 when recording record does not exist', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);
        mockPrisma.interviewRecording.findUnique.mockResolvedValue(null);

        await expect(
            downloadServerRecording('user-recruiter', 'RECRUITER', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 404 }));
    });
});

// ─── getMessages ──────────────────────────────────────────────────────────────

describe('getMessages', () => {
    const fullInterview = {
        ...fakeInterview,
        student: { ...fakeStudent, userId: 'user-student' },
        recruiter: { ...fakeRecruiter, userId: 'user-recruiter' },
    };

    it('returns mapped messages for the interview student', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);
        mockPrisma.interviewMessage.findMany.mockResolvedValue([
            {
                id: 'msg-1',
                content: 'Hello',
                createdAt: new Date(),
                sender: { cnid: 'CN001', studentProfile: { name: 'Bob' }, recruiterProfile: null },
            },
        ]);

        const result = await getMessages('user-student', 'STUDENT', 'iv-1');

        expect(result).toHaveLength(1);
        expect(result[0].senderName).toBe('Bob');
        expect(result[0].text).toBe('Hello');
    });

    it('throws 403 when a different student requests the chat', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(fullInterview);

        await expect(
            getMessages('user-intruder', 'STUDENT', 'iv-1')
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 404 when the interview does not exist', async () => {
        mockPrisma.interview.findUnique.mockResolvedValue(null);

        await expect(getMessages('u', 'STUDENT', 'bad-id')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});
