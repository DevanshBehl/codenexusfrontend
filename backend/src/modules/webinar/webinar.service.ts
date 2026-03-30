import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateWebinarInput } from "./webinar.schema.js";

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
