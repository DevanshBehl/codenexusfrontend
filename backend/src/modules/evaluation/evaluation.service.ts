import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { SubmitEvaluationInput } from "./evaluation.schema.js";

export const getCompanyEvaluations = async (userId: string, status?: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Company profile not found");

    const recruiterIds = (await prisma.recruiter.findMany({
        where: { companyId: company.id },
        select: { id: true }
    })).map(r => r.id);

    const interviews = await prisma.interview.findMany({
        where: {
            recruiterId: { in: recruiterIds },
            status: 'COMPLETED'
        },
        include: {
            student: {
                include: {
                    university: { select: { name: true } },
                    submissions: {
                        where: { status: 'AC' },
                        select: { problemId: true },
                        distinct: ['problemId']
                    }
                }
            },
            recruiter: { select: { name: true } },
            recording: true,
            interviewRecording: true,
            evaluation: true
        },
        orderBy: { scheduledAt: 'desc' }
    });

    let filtered = interviews;
    if (status === 'PENDING') {
        filtered = interviews.filter(i => !i.evaluation);
    } else if (status === 'EVALUATED') {
        filtered = interviews.filter(i => i.evaluation);
    }

    return filtered.map(i => {
        const duration = i.interviewRecording?.duration_seconds
            ? `${Math.floor(i.interviewRecording.duration_seconds / 60)} min`
            : i.recording?.durationStr || '—';

        return {
            id: i.id,
            student: i.student.name,
            university: i.student.university.name,
            recruiter: i.recruiter.name,
            role: i.role,
            date: i.scheduledAt.toISOString(),
            duration,
            rating: i.recording?.rating || 0,
            notes: i.recording?.notes || '',
            evaluatorNote: i.evaluation?.notes || undefined,
            status: i.evaluation?.verdict || 'PENDING',
            questions: []
        };
    });
};

export const getEvaluationDetail = async (userId: string, interviewId: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Company profile not found");

    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            student: {
                include: {
                    university: { select: { name: true } },
                    submissions: {
                        where: { status: 'AC' },
                        select: {
                            problemId: true,
                            code: true,
                            language: true,
                            problem: {
                                select: {
                                    id: true,
                                    title: true,
                                    testCases: { select: { id: true } }
                                }
                            }
                        }
                    }
                }
            },
            recruiter: { select: { name: true } },
            recording: true,
            interviewRecording: true,
            evaluation: true
        }
    });

    if (!interview) throw new ApiError(404, "Interview not found");

    const recruiterIds = (await prisma.recruiter.findMany({
        where: { companyId: company.id },
        select: { id: true }
    })).map(r => r.id);

    if (!recruiterIds.includes(interview.recruiterId)) {
        throw new ApiError(403, "Not authorized to view this evaluation");
    }

    const duration = interview.interviewRecording?.duration_seconds
        ? `${Math.floor(interview.interviewRecording.duration_seconds / 60)} min`
        : interview.recording?.durationStr || '—';

    const contestSubmissions = await prisma.submission.findMany({
        where: {
            studentId: interview.studentId,
            problem: { contest: { companyId: company.id } }
        },
        include: {
            problem: { select: { title: true, testCases: { select: { id: true } } } }
        }
    });

    const questions = contestSubmissions.map(s => ({
        title: s.problem.title,
        testCasesPassed: s.passed,
        totalTestCases: s.total,
        codeSubmission: s.code,
        language: s.language
    }));

    return {
        id: interview.id,
        student: interview.student.name,
        university: interview.student.university.name,
        recruiter: interview.recruiter.name,
        role: interview.role,
        date: interview.scheduledAt.toISOString(),
        duration,
        rating: interview.recording?.rating || 0,
        notes: interview.recording?.notes || '',
        evaluatorNote: interview.evaluation?.notes || undefined,
        status: interview.evaluation?.verdict || 'PENDING',
        technicalScore: interview.evaluation?.technicalScore || undefined,
        communicationScore: interview.evaluation?.communicationScore || undefined,
        cultureScore: interview.evaluation?.cultureScore || undefined,
        questions
    };
};

export const submitEvaluation = async (
    userId: string,
    interviewId: string,
    data: SubmitEvaluationInput
) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Company profile not found");

    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            recruiter: { select: { companyId: true } },
            student: { select: { id: true } }
        }
    });

    if (!interview) throw new ApiError(404, "Interview not found");
    if (interview.recruiter.companyId !== company.id) {
        throw new ApiError(403, "Not authorized to evaluate this interview");
    }

    const existing = await prisma.evaluation.findUnique({
        where: { interviewId }
    });

    let evaluation;
    if (existing) {
        evaluation = await prisma.evaluation.update({
            where: { interviewId },
            data: {
                verdict: data.verdict,
                notes: data.notes,
                rating: data.rating,
                technicalScore: data.technicalScore,
                communicationScore: data.communicationScore,
                cultureScore: data.cultureScore,
                evaluatorId: userId
            }
        });
    } else {
        evaluation = await prisma.evaluation.create({
            data: {
                interviewId,
                companyId: company.id,
                verdict: data.verdict,
                notes: data.notes,
                rating: data.rating,
                technicalScore: data.technicalScore,
                communicationScore: data.communicationScore,
                cultureScore: data.cultureScore,
                evaluatorId: userId
            }
        });
    }

    if (data.verdict === 'SELECTED' || data.verdict === 'REJECTED') {
        const applicationStatus = data.verdict === 'SELECTED' ? 'SELECTED' : 'REJECTED';
        await prisma.jobApplication.updateMany({
            where: {
                studentId: interview.student.id,
                companyId: company.id
            },
            data: { status: applicationStatus }
        });
    }

    return evaluation;
};