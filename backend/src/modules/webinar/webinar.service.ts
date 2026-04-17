import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateWebinarInput, UpdateWebinarInput } from "./webinar.schema.js";

export const createWebinar = async (userId: string, data: CreateWebinarInput) => {
    const company = await prisma.company.findUnique({
        where: { userId }
    });
    if (!company) {
        throw new ApiError(403, "You must create a company profile before scheduling a webinar");
    }

    // Combine date + time into a single DateTime
    const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`);

    return await prisma.webinar.create({
        data: {
            companyId: company.id,
            title: data.title,
            agenda: data.agenda,
            scheduledAt,
            durationMins: data.durationMins ?? 60,
            meetingLink: data.meetingLink,
            targetUniversities: {
                create: data.targetUniversityIds.map(uniId => ({
                    universityId: uniId,
                }))
            }
        },
        include: {
            targetUniversities: {
                include: {
                    university: { select: { id: true, name: true, location: true } }
                }
            }
        }
    });
}

export const getWebinars = async (companyUserId?: string) => {
    const where: any = {};
    if (companyUserId) {
        const company = await prisma.company.findUnique({ where: { userId: companyUserId } });
        if (company) {
            where.companyId = company.id;
        }
    }

    return await prisma.webinar.findMany({
        where,
        include: {
            company: { select: { name: true, industry: true } },
            targetUniversities: {
                include: {
                    university: { select: { id: true, name: true } }
                }
            }
        },
        orderBy: { scheduledAt: 'desc' }
    });
}

export const getWebinarById = async (id: string) => {
    const webinar = await prisma.webinar.findUnique({
        where: { id },
        include: {
            company: { select: { name: true, industry: true } },
            targetUniversities: {
                include: {
                    university: { select: { id: true, name: true, location: true } }
                }
            }
        }
    });
    if (!webinar) {
        throw new ApiError(404, "Webinar not found");
    }
    return webinar;
}

export const updateWebinar = async (userId: string, id: string, data: UpdateWebinarInput) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can modify webinars");

    const webinar = await prisma.webinar.findUnique({ where: { id } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    if (webinar.companyId !== company.id) throw new ApiError(403, "You can't modify someone else's webinar");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.agenda !== undefined) updateData.agenda = data.agenda;
    if (data.durationMins !== undefined) updateData.durationMins = data.durationMins;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.scheduledDate || data.scheduledTime) {
        const iso = webinar.scheduledAt.toISOString();
        const existingDate = iso.split('T')[0];
        const existingTime = (iso.split('T')[1] ?? '00:00').substring(0, 5);
        const date = data.scheduledDate || existingDate;
        const time = data.scheduledTime || existingTime;
        updateData.scheduledAt = new Date(`${date}T${time}:00`);
    }

    if (data.targetUniversityIds) {
        updateData.targetUniversities = {
            deleteMany: {},
            create: data.targetUniversityIds.map(uniId => ({
                universityId: uniId,
            }))
        };
    }

    return await prisma.webinar.update({
        where: { id },
        data: updateData,
        include: { targetUniversities: true }
    });
}

export const deleteWebinar = async (userId: string, id: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can delete webinars");

    const webinar = await prisma.webinar.findUnique({ where: { id } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    if (webinar.companyId !== company.id) throw new ApiError(403, "You can't delete someone else's webinar");

    await prisma.webinar.delete({ where: { id } });
    return { success: true };
}

export const getWebinarAttendees = async (webinarId: string) => {
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    return await prisma.webinarAttendee.findMany({
        where: { webinarId },
        orderBy: { joinedAt: 'asc' }
    });
}

export const joinWebinar = async (webinarId: string, userId: string, role: string = 'VIEWER') => {
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    const existing = await prisma.webinarAttendee.findUnique({
        where: { webinarId_userId: { webinarId, userId } }
    });

    if (existing) {
        if (existing.leftAt) {
            return await prisma.webinarAttendee.update({
                where: { webinarId_userId: { webinarId, userId } },
                data: { leftAt: null, role }
            });
        }
        return existing;
    }

    return await prisma.webinarAttendee.create({
        data: { webinarId, userId, role }
    });
}

export const leaveWebinar = async (webinarId: string, userId: string) => {
    const attendee = await prisma.webinarAttendee.findUnique({
        where: { webinarId_userId: { webinarId, userId } }
    });
    if (!attendee) throw new ApiError(404, "Attendee not found");

    return await prisma.webinarAttendee.update({
        where: { webinarId_userId: { webinarId, userId } },
        data: { leftAt: new Date() }
    });
}

export const grantPermission = async (webinarId: string, userId: string) => {
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    const attendee = await prisma.webinarAttendee.findUnique({
        where: { webinarId_userId: { webinarId, userId } }
    });
    if (!attendee) throw new ApiError(404, "Attendee not found");

    return await prisma.webinarAttendee.update({
        where: { webinarId_userId: { webinarId, userId } },
        data: { hasPermissionToSpeak: true }
    });
}

export const revokePermission = async (webinarId: string, userId: string) => {
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    const attendee = await prisma.webinarAttendee.findUnique({
        where: { webinarId_userId: { webinarId, userId } }
    });
    if (!attendee) throw new ApiError(404, "Attendee not found");

    return await prisma.webinarAttendee.update({
        where: { webinarId_userId: { webinarId, userId } },
        data: { hasPermissionToSpeak: false }
    });
}

export const getWebinarMessages = async (webinarId: string) => {
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    return await prisma.webinarMessage.findMany({
        where: { webinarId },
        orderBy: { createdAt: 'asc' }
    });
}

export const createWebinarMessage = async (
    webinarId: string,
    senderId: string,
    senderName: string,
    content: string,
    isQuestion: boolean = false
) => {
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    return await prisma.webinarMessage.create({
        data: { webinarId, senderId, senderName, content, isQuestion }
    });
}
