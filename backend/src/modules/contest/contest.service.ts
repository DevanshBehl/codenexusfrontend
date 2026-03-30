import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateContestInput } from "./contest.schema.js";

export const createContest = async (userId: string, data: CreateContestInput) => {
    const company = await prisma.company.findUnique({
        where: { userId }
    });
    if (!company) {
        throw new ApiError(403, "You must create a company profile before creating a contest");
    }

    // Parse the duration string (e.g. "2 hours") into minutes
    let durationMins = data.durationMins;
    if (!durationMins) {
        durationMins = 120; // Default 2 hours
    }

    // Create the contest with nested problems and test cases in a single transaction
    return await prisma.contest.create({
        data: {
            companyId: company.id,
            title: data.title,
            description: data.description ?? null,
            date: new Date(data.scheduledDate),
            durationMins: durationMins,
            timeLimitMinutes: data.timeLimitMinutes ?? 30,
            languages: data.languages,
            problems: {
                create: data.questions.map(q => ({
                    title: q.title,
                    description: q.statement,
                    difficulty: q.difficulty,
                    points: q.points ?? 100,
                    constraints: q.constraints ?? null,
                    testCases: {
                        create: q.testCases.map(tc => ({
                            input: tc.input,
                            output: tc.expectedOutput,
                            isHidden: false,
                        }))
                    }
                }))
            }
        },
        include: {
            problems: {
                include: { testCases: true }
            }
        }
    });
}

export const getContests = async () => {
    return await prisma.contest.findMany({
        include: {
            company: {
                select: {
                    name: true,
                    industry: true
                }
            },
            _count: {
                select: { problems: true }
            }
        },
        orderBy: { date: 'desc' }
    });
}

export const getContestById = async (id: string) => {
    const contest = await prisma.contest.findUnique({
        where: { id },
        include: {
            company: {
                select: { name: true, industry: true }
            },
            problems: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true,
                    constraints: true,
                    description: true,
                    _count: { select: { testCases: true } }
                }
            }
        }
    });
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    return contest;
}