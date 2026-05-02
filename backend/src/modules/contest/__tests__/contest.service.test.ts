import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../lib/prisma.js', () => ({
    prisma: {
        company: { findUnique: vi.fn() },
        contest: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
        student: { findUnique: vi.fn() },
        contestRegistration: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
        submission: { findMany: vi.fn() },
        user: { findMany: vi.fn() },
    },
}));

vi.mock('../../codearena/leaderboard.service.js', () => ({
    getContestLeaderboard: vi.fn(),
    updateContestLeaderboard: vi.fn(),
    getUserContestRank: vi.fn(),
}));

import { prisma } from '../../../lib/prisma.js';
import * as leaderboardService from '../../codearena/leaderboard.service.js';
import {
    createContest,
    getContests,
    getContestById,
    registerStudent,
    updateContest,
    deleteContest,
    getContestLeaderboard,
} from '../contest.service.js';

const mockPrisma = prisma as any;
const mockLeaderboard = leaderboardService as any;

const fakeCompany = { id: 'company-1', userId: 'user-admin', name: 'Acme' };
const fakeStudent = { id: 'stu-1', userId: 'user-student' };

const contestInput = {
    title: 'Winter Code Sprint',
    description: 'A coding competition',
    scheduledDate: '2025-12-01',
    durationMins: 120,
    timeLimitMinutes: 30,
    languages: ['python', 'cpp'],
    questions: [
        {
            title: 'Two Sum',
            difficulty: 'EASY' as const,
            points: 100,
            statement: 'Find two numbers that add up to target',
            constraints: '1 ≤ n ≤ 10^4',
            testCases: [{ input: '2 7 11 15\n9', expectedOutput: '0 1' }],
        },
    ],
};

const now = new Date();
const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);   // 1 week ago

const fakeContest = {
    id: 'contest-1',
    companyId: 'company-1',
    title: 'Winter Code Sprint',
    durationMins: 120,
    date: futureDate,
    company: { name: 'Acme', industry: 'Tech' },
    _count: { problems: 1, registrations: 5 },
};

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createContest ────────────────────────────────────────────────────────────

describe('createContest', () => {
    it('creates a contest when the company exists', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.contest.create.mockResolvedValue({ ...fakeContest, problems: [] });

        const result = await createContest('user-admin', contestInput);

        expect(mockPrisma.contest.create).toHaveBeenCalledOnce();
        expect(result.id).toBe('contest-1');
    });

    it('throws 403 when the user has no company profile', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(null);

        await expect(createContest('user-admin', contestInput)).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
        expect(mockPrisma.contest.create).not.toHaveBeenCalled();
    });

    it('defaults durationMins to 120 when not provided', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.contest.create.mockResolvedValue({ ...fakeContest, problems: [] });

        const inputWithoutDuration = { ...contestInput, durationMins: undefined as any };
        await createContest('user-admin', inputWithoutDuration);

        const createCall = mockPrisma.contest.create.mock.calls[0][0];
        expect(createCall.data.durationMins).toBe(120);
    });
});

// ─── getContests ──────────────────────────────────────────────────────────────

describe('getContests', () => {
    it('marks a future contest as UPCOMING', async () => {
        mockPrisma.contest.findMany.mockResolvedValue([{ ...fakeContest, date: futureDate }]);

        const [result] = await getContests();

        expect(result.status).toBe('UPCOMING');
    });

    it('marks a past contest as ENDED', async () => {
        const endedContest = { ...fakeContest, date: pastDate, durationMins: 60 };
        mockPrisma.contest.findMany.mockResolvedValue([endedContest]);

        const [result] = await getContests();

        expect(result.status).toBe('ENDED');
    });

    it('marks an ongoing contest as ONGOING', async () => {
        // Contest started 10 minutes ago with a 60 minute duration
        const ongoingDate = new Date(now.getTime() - 10 * 60 * 1000);
        const ongoingContest = { ...fakeContest, date: ongoingDate, durationMins: 60 };
        mockPrisma.contest.findMany.mockResolvedValue([ongoingContest]);

        const [result] = await getContests();

        expect(result.status).toBe('ONGOING');
    });

    it('filters by company when a company user ID is supplied', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.contest.findMany.mockResolvedValue([fakeContest]);

        await getContests('user-admin');

        expect(mockPrisma.contest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { companyId: 'company-1' } })
        );
    });
});

// ─── getContestById ───────────────────────────────────────────────────────────

describe('getContestById', () => {
    it('returns the contest with its computed status', async () => {
        mockPrisma.contest.findUnique.mockResolvedValue({
            ...fakeContest,
            problems: [],
        });

        const result = await getContestById('contest-1');

        expect(result.id).toBe('contest-1');
        expect(result.status).toBe('UPCOMING');
    });

    it('throws 404 when the contest does not exist', async () => {
        mockPrisma.contest.findUnique.mockResolvedValue(null);

        await expect(getContestById('missing')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── registerStudent ──────────────────────────────────────────────────────────

describe('registerStudent', () => {
    it('registers a student for the contest', async () => {
        mockPrisma.student.findUnique.mockResolvedValue(fakeStudent);
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest);
        mockPrisma.contestRegistration.findFirst.mockResolvedValue(null);
        mockPrisma.contestRegistration.create.mockResolvedValue({
            studentId: 'stu-1',
            contestId: 'contest-1',
        });

        const result = await registerStudent('user-student', 'contest-1');

        expect(mockPrisma.contestRegistration.create).toHaveBeenCalledOnce();
        expect(result.contestId).toBe('contest-1');
    });

    it('throws 403 when the user is not a student', async () => {
        mockPrisma.student.findUnique.mockResolvedValue(null);

        await expect(registerStudent('user-admin', 'contest-1')).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
    });

    it('throws 404 when the contest does not exist', async () => {
        mockPrisma.student.findUnique.mockResolvedValue(fakeStudent);
        mockPrisma.contest.findUnique.mockResolvedValue(null);

        await expect(registerStudent('user-student', 'missing')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });

    it('throws 400 when the student is already registered', async () => {
        mockPrisma.student.findUnique.mockResolvedValue(fakeStudent);
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest);
        mockPrisma.contestRegistration.findFirst.mockResolvedValue({ studentId: 'stu-1', contestId: 'contest-1' });

        await expect(registerStudent('user-student', 'contest-1')).rejects.toThrow(
            expect.objectContaining({ statusCode: 400 })
        );
        expect(mockPrisma.contestRegistration.create).not.toHaveBeenCalled();
    });
});

// ─── updateContest ────────────────────────────────────────────────────────────

describe('updateContest', () => {
    it('updates the contest when the caller owns it', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest);
        mockPrisma.contest.update.mockResolvedValue({ ...fakeContest, title: 'Updated Sprint' });

        const result = await updateContest('user-admin', 'contest-1', { title: 'Updated Sprint' });

        expect(result.title).toBe('Updated Sprint');
    });

    it('throws 403 when the caller does not own the contest', async () => {
        mockPrisma.company.findUnique.mockResolvedValue({ ...fakeCompany, id: 'other-company' });
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest); // companyId = 'company-1'

        await expect(
            updateContest('user-other', 'contest-1', { title: 'Hack' })
        ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('throws 404 when the contest does not exist', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.contest.findUnique.mockResolvedValue(null);

        await expect(updateContest('user-admin', 'missing', {})).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });

    it('throws 403 when the user has no company profile', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(null);

        await expect(updateContest('user-admin', 'contest-1', {})).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
    });
});

// ─── deleteContest ────────────────────────────────────────────────────────────

describe('deleteContest', () => {
    it('deletes the contest when the caller owns it', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest);
        mockPrisma.contest.delete.mockResolvedValue(fakeContest);

        const result = await deleteContest('user-admin', 'contest-1');

        expect(result).toEqual({ success: true });
        expect(mockPrisma.contest.delete).toHaveBeenCalledWith({ where: { id: 'contest-1' } });
    });

    it('throws 403 when the caller does not own the contest', async () => {
        mockPrisma.company.findUnique.mockResolvedValue({ ...fakeCompany, id: 'other-company' });
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest);

        await expect(deleteContest('user-other', 'contest-1')).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
        expect(mockPrisma.contest.delete).not.toHaveBeenCalled();
    });
});

// ─── getContestLeaderboard ────────────────────────────────────────────────────

describe('getContestLeaderboard', () => {
    it('returns cached leaderboard rankings when they exist', async () => {
        mockPrisma.contest.findUnique.mockResolvedValue(fakeContest);
        mockLeaderboard.getContestLeaderboard.mockResolvedValue({
            rankings: [{ cnid: 'CN001', rank: 1, score: 19950 }],
            myRank: null,
            totalParticipants: 1,
        });
        mockPrisma.user.findMany.mockResolvedValue([
            { cnid: 'CN001', studentProfile: { name: 'Alice' } },
        ]);
        mockLeaderboard.getUserContestRank.mockResolvedValue(null);

        const result = await getContestLeaderboard('contest-1');

        expect(result.rankings).toHaveLength(1);
        expect(result.rankings[0].displayName).toBe('Alice');
    });

    it('throws 404 when the contest does not exist', async () => {
        mockPrisma.contest.findUnique.mockResolvedValue(null);

        await expect(getContestLeaderboard('missing')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});
