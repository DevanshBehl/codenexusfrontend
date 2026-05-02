import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiError } from '../../../utils/api-error.js';

vi.mock('../../../lib/prisma.js', () => ({
    prisma: {
        company: { findUnique: vi.fn() },
        webinar: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        webinarAttendee: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
        webinarMessage: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

import { prisma } from '../../../lib/prisma.js';
import {
    createWebinar,
    getWebinars,
    getWebinarById,
    updateWebinar,
    deleteWebinar,
    joinWebinar,
    leaveWebinar,
    grantPermission,
    revokePermission,
    getWebinarMessages,
    createWebinarMessage,
} from '../webinar.service.js';

const mockPrisma = prisma as any;

const baseWebinarInput = {
    title: 'Tech Talk 2025',
    agenda: 'Discussing latest trends in software engineering',
    scheduledDate: '2025-08-01',
    scheduledTime: '14:00',
    durationMins: 60,
    meetingLink: 'https://meet.example.com/123',
    targetUniversityIds: ['uni-1', 'uni-2'],
};

const fakeCompany = { id: 'company-1', userId: 'user-1', name: 'Acme Corp' };
const fakeWebinar = {
    id: 'webinar-1',
    companyId: 'company-1',
    title: 'Tech Talk 2025',
    scheduledAt: new Date('2025-08-01T14:00:00'),
};

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createWebinar ────────────────────────────────────────────────────────────

describe('createWebinar', () => {
    it('creates a webinar when the company exists', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.create.mockResolvedValue({ ...fakeWebinar, targetUniversities: [] });

        const result = await createWebinar('user-1', baseWebinarInput);

        expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
        expect(mockPrisma.webinar.create).toHaveBeenCalledOnce();
        expect(result.id).toBe('webinar-1');
    });

    it('throws 403 when the user has no company profile', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(null);

        await expect(createWebinar('user-1', baseWebinarInput)).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
        expect(mockPrisma.webinar.create).not.toHaveBeenCalled();
    });

    it('combines scheduledDate and scheduledTime into a single DateTime', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.create.mockResolvedValue({ ...fakeWebinar, targetUniversities: [] });

        await createWebinar('user-1', { ...baseWebinarInput, scheduledDate: '2025-09-15', scheduledTime: '09:30' });

        const createCall = mockPrisma.webinar.create.mock.calls[0][0];
        expect(createCall.data.scheduledAt).toEqual(new Date('2025-09-15T09:30:00'));
    });
});

// ─── getWebinars ──────────────────────────────────────────────────────────────

describe('getWebinars', () => {
    it('returns all webinars when no filter is supplied', async () => {
        const list = [fakeWebinar, { ...fakeWebinar, id: 'webinar-2' }];
        mockPrisma.webinar.findMany.mockResolvedValue(list);

        const result = await getWebinars();

        expect(mockPrisma.webinar.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: {} })
        );
        expect(result).toHaveLength(2);
    });

    it('filters by company when a company user ID is supplied', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.findMany.mockResolvedValue([fakeWebinar]);

        const result = await getWebinars('user-1');

        expect(mockPrisma.webinar.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { companyId: 'company-1' } })
        );
        expect(result).toHaveLength(1);
    });
});

// ─── getWebinarById ───────────────────────────────────────────────────────────

describe('getWebinarById', () => {
    it('returns the webinar when it exists', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);

        const result = await getWebinarById('webinar-1');

        expect(result.id).toBe('webinar-1');
    });

    it('throws 404 when the webinar does not exist', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(null);

        await expect(getWebinarById('missing-id')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── updateWebinar ────────────────────────────────────────────────────────────

describe('updateWebinar', () => {
    it('updates the webinar when the caller is the owner', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        mockPrisma.webinar.update.mockResolvedValue({ ...fakeWebinar, title: 'Updated Title' });

        const result = await updateWebinar('user-1', 'webinar-1', { title: 'Updated Title' });

        expect(result.title).toBe('Updated Title');
    });

    it('throws 403 when the caller does not own the webinar', async () => {
        mockPrisma.company.findUnique.mockResolvedValue({ ...fakeCompany, id: 'other-company' });
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar); // companyId = 'company-1'

        await expect(updateWebinar('user-2', 'webinar-1', { title: 'Hack' })).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
    });

    it('throws 404 when the webinar does not exist', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.findUnique.mockResolvedValue(null);

        await expect(updateWebinar('user-1', 'missing-id', {})).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });

    it('throws 403 when the user has no company profile', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(null);

        await expect(updateWebinar('user-1', 'webinar-1', {})).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
    });
});

// ─── deleteWebinar ────────────────────────────────────────────────────────────

describe('deleteWebinar', () => {
    it('deletes the webinar when the caller is the owner', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        mockPrisma.webinar.delete.mockResolvedValue(fakeWebinar);

        const result = await deleteWebinar('user-1', 'webinar-1');

        expect(result).toEqual({ success: true });
        expect(mockPrisma.webinar.delete).toHaveBeenCalledWith({ where: { id: 'webinar-1' } });
    });

    it('throws 403 when the caller does not own the webinar', async () => {
        mockPrisma.company.findUnique.mockResolvedValue({ ...fakeCompany, id: 'other-company' });
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);

        await expect(deleteWebinar('user-2', 'webinar-1')).rejects.toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
        expect(mockPrisma.webinar.delete).not.toHaveBeenCalled();
    });

    it('throws 404 when the webinar does not exist', async () => {
        mockPrisma.company.findUnique.mockResolvedValue(fakeCompany);
        mockPrisma.webinar.findUnique.mockResolvedValue(null);

        await expect(deleteWebinar('user-1', 'missing-id')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── joinWebinar ──────────────────────────────────────────────────────────────

describe('joinWebinar', () => {
    it('creates a new attendee record on first join', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(null);
        const newAttendee = { webinarId: 'webinar-1', userId: 'user-5', role: 'VIEWER', leftAt: null };
        mockPrisma.webinarAttendee.create.mockResolvedValue(newAttendee);

        const result = await joinWebinar('webinar-1', 'user-5');

        expect(mockPrisma.webinarAttendee.create).toHaveBeenCalledOnce();
        expect(result.userId).toBe('user-5');
    });

    it('re-activates the attendee record when re-joining after leaving', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        const leftAttendee = { webinarId: 'webinar-1', userId: 'user-5', leftAt: new Date() };
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(leftAttendee);
        mockPrisma.webinarAttendee.update.mockResolvedValue({ ...leftAttendee, leftAt: null });

        await joinWebinar('webinar-1', 'user-5');

        expect(mockPrisma.webinarAttendee.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ leftAt: null }) })
        );
        expect(mockPrisma.webinarAttendee.create).not.toHaveBeenCalled();
    });

    it('returns the existing record without modification when user is already attending', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        const activeAttendee = { webinarId: 'webinar-1', userId: 'user-5', leftAt: null };
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(activeAttendee);

        const result = await joinWebinar('webinar-1', 'user-5');

        expect(mockPrisma.webinarAttendee.update).not.toHaveBeenCalled();
        expect(mockPrisma.webinarAttendee.create).not.toHaveBeenCalled();
        expect(result).toEqual(activeAttendee);
    });

    it('throws 404 when the webinar does not exist', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(null);

        await expect(joinWebinar('missing-id', 'user-5')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── leaveWebinar ─────────────────────────────────────────────────────────────

describe('leaveWebinar', () => {
    it('sets leftAt when the attendee leaves', async () => {
        const attendee = { webinarId: 'webinar-1', userId: 'user-5', leftAt: null };
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(attendee);
        mockPrisma.webinarAttendee.update.mockResolvedValue({ ...attendee, leftAt: new Date() });

        await leaveWebinar('webinar-1', 'user-5');

        expect(mockPrisma.webinarAttendee.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ leftAt: expect.any(Date) }) })
        );
    });

    it('throws 404 when the attendee record does not exist', async () => {
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(null);

        await expect(leaveWebinar('webinar-1', 'user-5')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

// ─── grantPermission / revokePermission ───────────────────────────────────────

describe('grantPermission', () => {
    it('grants speak permission to an attendee', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        const attendee = { webinarId: 'webinar-1', userId: 'user-5', hasPermissionToSpeak: false };
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(attendee);
        mockPrisma.webinarAttendee.update.mockResolvedValue({ ...attendee, hasPermissionToSpeak: true });

        await grantPermission('webinar-1', 'user-5');

        expect(mockPrisma.webinarAttendee.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { hasPermissionToSpeak: true } })
        );
    });

    it('throws 404 when the attendee does not exist', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(null);

        await expect(grantPermission('webinar-1', 'user-ghost')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

describe('revokePermission', () => {
    it('revokes speak permission from an attendee', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        const attendee = { webinarId: 'webinar-1', userId: 'user-5', hasPermissionToSpeak: true };
        mockPrisma.webinarAttendee.findUnique.mockResolvedValue(attendee);
        mockPrisma.webinarAttendee.update.mockResolvedValue({ ...attendee, hasPermissionToSpeak: false });

        await revokePermission('webinar-1', 'user-5');

        expect(mockPrisma.webinarAttendee.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { hasPermissionToSpeak: false } })
        );
    });
});

// ─── getWebinarMessages / createWebinarMessage ────────────────────────────────

describe('getWebinarMessages', () => {
    it('returns messages in chronological order', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        const messages = [
            { id: 'msg-1', content: 'Hello', createdAt: new Date('2025-08-01T14:01:00') },
            { id: 'msg-2', content: 'World', createdAt: new Date('2025-08-01T14:02:00') },
        ];
        mockPrisma.webinarMessage.findMany.mockResolvedValue(messages);

        const result = await getWebinarMessages('webinar-1');

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('msg-1');
    });

    it('throws 404 when the webinar does not exist', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(null);

        await expect(getWebinarMessages('missing-id')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});

describe('createWebinarMessage', () => {
    it('creates a chat message in the webinar', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(fakeWebinar);
        const newMsg = { id: 'msg-3', webinarId: 'webinar-1', content: 'Hello!', isQuestion: false };
        mockPrisma.webinarMessage.create.mockResolvedValue(newMsg);

        const result = await createWebinarMessage('webinar-1', 'user-5', 'Alice', 'Hello!');

        expect(mockPrisma.webinarMessage.create).toHaveBeenCalledOnce();
        expect(result.content).toBe('Hello!');
    });

    it('throws 404 when the webinar does not exist', async () => {
        mockPrisma.webinar.findUnique.mockResolvedValue(null);

        await expect(createWebinarMessage('bad-id', 'u', 'name', 'text')).rejects.toThrow(
            expect.objectContaining({ statusCode: 404 })
        );
    });
});
