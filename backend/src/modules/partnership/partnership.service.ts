import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";

export const getAllUniversitiesWithStatus = async (userId: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(404, "Company profile not found");

    const universities = await prisma.university.findMany({
        select: {
            id: true,
            name: true,
            location: true,
            tier: true,
            students: { select: { id: true } },
            partnerCompanies: {
                where: { companyId: company.id },
                select: { status: true },
            },
        },
    });

    return universities.map((u) => ({
        id: u.id,
        name: u.name,
        location: u.location,
        tier: u.tier,
        studentCount: u.students.length,
        partnershipStatus: u.partnerCompanies[0]?.status ?? null,
    }));
};

export const sendPartnershipRequest = async (userId: string, universityId: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(404, "Company profile not found");

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) throw new ApiError(404, "University not found");

    const existing = await prisma.companyUniversity.findUnique({
        where: { companyId_universityId: { companyId: company.id, universityId } },
    });

    if (existing) {
        if (existing.status === "APPROVED") throw new ApiError(400, "Already partnered with this university");
        if (existing.status === "PENDING") throw new ApiError(400, "Request already pending");
        // REJECTED — allow re-request
        return await prisma.companyUniversity.update({
            where: { companyId_universityId: { companyId: company.id, universityId } },
            data: { status: "PENDING" },
        });
    }

    return await prisma.companyUniversity.create({
        data: { companyId: company.id, universityId, status: "PENDING" },
    });
};

export const getPendingRequests = async (userId: string) => {
    const university = await prisma.university.findUnique({ where: { userId } });
    if (!university) throw new ApiError(404, "University profile not found");

    return await prisma.companyUniversity.findMany({
        where: { universityId: university.id, status: "PENDING" },
        include: {
            company: { select: { id: true, name: true, industry: true, description: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

export const updatePartnershipStatus = async (userId: string, companyId: string, status: "APPROVED" | "REJECTED") => {
    const university = await prisma.university.findUnique({ where: { userId } });
    if (!university) throw new ApiError(404, "University profile not found");

    const partnership = await prisma.companyUniversity.findUnique({
        where: { companyId_universityId: { companyId, universityId: university.id } },
    });
    if (!partnership) throw new ApiError(404, "Partnership request not found");
    if (partnership.status !== "PENDING") throw new ApiError(400, "Request is not pending");

    return await prisma.companyUniversity.update({
        where: { companyId_universityId: { companyId, universityId: university.id } },
        data: { status },
    });
};
