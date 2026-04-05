import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { Role } from "../../generated/prisma/enums.js";
import { parseCnidRole, isValidCnidFormat } from "../../utils/cnid.js";
import { checkMailPermission, getAllowedRecipients, logPermissionViolation } from "../../utils/permission-matrix.js";
import { sanitizeMailBody, sanitizeMailSubject } from "../../utils/content-sanitizer.js";
import { getCachedUnreadCount, setCachedUnreadCount, invalidateUnreadCountCache } from "../../lib/cache.js";
import { emitNewMailEvent } from "./mail.sse.js";
import { v4 as uuidv4 } from "uuid";

const SEND_RATE_LIMIT = 20;
const SEND_RATE_WINDOW_MS = 60 * 60 * 1000;

interface MailSenderInfo {
    cnid: string;
    role: Role;
    displayName: string;
}

interface MailRecipientInfo {
    cnid: string;
    role: Role;
    displayName: string;
}

interface UserDisplayInfo {
    cnid: string;
    displayName: string;
    role: string;
}

async function getUserByCnid(cnid: string): Promise<{ user: any; displayName: string } | null> {
    const user = await prisma.user.findUnique({
        where: { cnid },
        include: {
            studentProfile: { select: { name: true } },
            universityProfile: { select: { name: true } },
            companyProfile: { select: { name: true } },
            recruiterProfile: { select: { name: true } },
        },
    });

    if (!user) return null;

    let displayName = user.email;
    if (user.studentProfile) displayName = user.studentProfile.name;
    else if (user.universityProfile) displayName = user.universityProfile.name;
    else if (user.companyProfile) displayName = user.companyProfile.name;
    else if (user.recruiterProfile) displayName = user.recruiterProfile.name;

    return { user, displayName };
}

async function checkSendRateLimit(senderCnid: string): Promise<void> {
    const windowStart = new Date(Date.now() - SEND_RATE_WINDOW_MS);
    const recentMails = await prisma.mail.count({
        where: {
            sender_cnid: senderCnid,
            sent_at: { gte: windowStart },
        },
    });

    if (recentMails >= SEND_RATE_LIMIT) {
        throw new ApiError(
            429,
            `Rate limit exceeded. You can send up to ${SEND_RATE_LIMIT} mails per hour.`
        );
    }
}

export async function sendMail(
    senderCnid: string,
    senderRole: Role,
    recipientCnid: string,
    subject: string,
    body: string,
    parentMailId?: string
): Promise<any> {
    if (!isValidCnidFormat(senderCnid)) {
        throw new ApiError(400, "Invalid sender CNID format");
    }

    if (!isValidCnidFormat(recipientCnid)) {
        throw new ApiError(400, "Invalid recipient CNID format");
    }

    const recipientInfo = await getUserByCnid(recipientCnid);
    if (!recipientInfo) {
        throw new ApiError(404, "Recipient CNID does not exist");
    }

    const recipientRole = recipientInfo.user.role as Role;
    checkMailPermission(senderRole, recipientRole);

    await checkSendRateLimit(senderCnid);

    const sanitizedSubject = sanitizeMailSubject(subject);
    const sanitizedBody = sanitizeMailBody(body);

    let threadId = uuidv4();
    let parentMail = null;

    if (parentMailId) {
        parentMail = await prisma.mail.findUnique({
            where: { id: parentMailId },
        });

        if (!parentMail) {
            throw new ApiError(404, "Parent mail not found");
        }

        if (parentMail.thread_id) {
            threadId = parentMail.thread_id;
        }
    }

    const senderInfo = await getUserByCnid(senderCnid);
    const senderDisplayName = senderInfo?.displayName || senderCnid;

    const mail = await prisma.mail.create({
        data: {
            sender_cnid: senderCnid,
            recipient_cnid: recipientCnid,
            subject: sanitizedSubject,
            body: sanitizedBody.body,
            thread_id: threadId,
            parent_mail_id: parentMailId || null,
        },
    });

    invalidateUnreadCountCache(recipientCnid);

    emitNewMailEvent(
        recipientCnid,
        senderDisplayName,
        senderCnid,
        sanitizedSubject,
        threadId,
        mail.id
    );

    return mail;
}

export async function getInbox(
    userCnid: string,
    page: number = 1,
    limit: number = 20
): Promise<{ mails: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where = {
        recipient_cnid: userCnid,
        is_deleted_recipient: false,
    };

    const [mails, total] = await Promise.all([
        prisma.mail.findMany({
            where,
            orderBy: { sent_at: "desc" },
            skip,
            take: limit,
            include: {
                sender: {
                    include: {
                        studentProfile: { select: { name: true } },
                        universityProfile: { select: { name: true } },
                        companyProfile: { select: { name: true } },
                        recruiterProfile: { select: { name: true } },
                    },
                },
            },
        }),
        prisma.mail.count({ where }),
    ]);

    const formattedMails = mails.map((mail) => {
        let senderName = mail.sender_cnid;
        if (mail.sender) {
            if (mail.sender.studentProfile) senderName = mail.sender.studentProfile.name;
            else if (mail.sender.universityProfile) senderName = mail.sender.universityProfile.name;
            else if (mail.sender.companyProfile) senderName = mail.sender.companyProfile.name;
            else if (mail.sender.recruiterProfile) senderName = mail.sender.recruiterProfile.name;
        }

        return {
            id: mail.id,
            sender_cnid: mail.sender_cnid,
            sender_name: senderName,
            subject: mail.subject,
            body: mail.body,
            sent_at: mail.sent_at,
            is_read: mail.is_read,
            thread_id: mail.thread_id,
            parent_mail_id: mail.parent_mail_id,
        };
    });

    return { mails: formattedMails, total, page, limit };
}

export async function getSentBox(
    userCnid: string,
    page: number = 1,
    limit: number = 20
): Promise<{ mails: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where = {
        sender_cnid: userCnid,
        is_deleted_sender: false,
    };

    const [mails, total] = await Promise.all([
        prisma.mail.findMany({
            where,
            orderBy: { sent_at: "desc" },
            skip,
            take: limit,
            include: {
                recipient: {
                    include: {
                        studentProfile: { select: { name: true } },
                        universityProfile: { select: { name: true } },
                        companyProfile: { select: { name: true } },
                        recruiterProfile: { select: { name: true } },
                    },
                },
            },
        }),
        prisma.mail.count({ where }),
    ]);

    const formattedMails = mails.map((mail) => {
        let recipientName = mail.recipient_cnid;
        if (mail.recipient) {
            if (mail.recipient.studentProfile) recipientName = mail.recipient.studentProfile.name;
            else if (mail.recipient.universityProfile) recipientName = mail.recipient.universityProfile.name;
            else if (mail.recipient.companyProfile) recipientName = mail.recipient.companyProfile.name;
            else if (mail.recipient.recruiterProfile) recipientName = mail.recipient.recruiterProfile.name;
        }

        return {
            id: mail.id,
            recipient_cnid: mail.recipient_cnid,
            recipient_name: recipientName,
            subject: mail.subject,
            body: mail.body,
            sent_at: mail.sent_at,
            thread_id: mail.thread_id,
            parent_mail_id: mail.parent_mail_id,
        };
    });

    return { mails: formattedMails, total, page, limit };
}

export async function getMailById(
    userCnid: string,
    mailId: string
): Promise<any> {
    const mail = await prisma.mail.findUnique({
        where: { id: mailId },
        include: {
            sender: {
                include: {
                    studentProfile: { select: { name: true } },
                    universityProfile: { select: { name: true } },
                    companyProfile: { select: { name: true } },
                    recruiterProfile: { select: { name: true } },
                },
            },
            recipient: {
                include: {
                    studentProfile: { select: { name: true } },
                    universityProfile: { select: { name: true } },
                    companyProfile: { select: { name: true } },
                    recruiterProfile: { select: { name: true } },
                },
            },
        },
    });

    if (!mail) {
        throw new ApiError(404, "Mail not found");
    }

    if (mail.sender_cnid !== userCnid && mail.recipient_cnid !== userCnid) {
        throw new ApiError(403, "You do not have access to this mail");
    }

    if (mail.recipient_cnid === userCnid && !mail.is_read) {
        await prisma.mail.update({
            where: { id: mailId },
            data: { is_read: true },
        });
        invalidateUnreadCountCache(userCnid);
    }

    let senderName = mail.sender_cnid;
    if (mail.sender) {
        if (mail.sender.studentProfile) senderName = mail.sender.studentProfile.name;
        else if (mail.sender.universityProfile) senderName = mail.sender.universityProfile.name;
        else if (mail.sender.companyProfile) senderName = mail.sender.companyProfile.name;
        else if (mail.sender.recruiterProfile) senderName = mail.sender.recruiterProfile.name;
    }

    let recipientName = mail.recipient_cnid;
    if (mail.recipient) {
        if (mail.recipient.studentProfile) recipientName = mail.recipient.studentProfile.name;
        else if (mail.recipient.universityProfile) recipientName = mail.recipient.universityProfile.name;
        else if (mail.recipient.companyProfile) recipientName = mail.recipient.companyProfile.name;
        else if (mail.recipient.recruiterProfile) recipientName = mail.recipient.recruiterProfile.name;
    }

    return {
        id: mail.id,
        sender_cnid: mail.sender_cnid,
        sender_name: senderName,
        recipient_cnid: mail.recipient_cnid,
        recipient_name: recipientName,
        subject: mail.subject,
        body: mail.body,
        sent_at: mail.sent_at,
        is_read: mail.is_read,
        thread_id: mail.thread_id,
        parent_mail_id: mail.parent_mail_id,
    };
}

export async function getThread(
    userCnid: string,
    threadId: string
): Promise<any[]> {
    const mails = await prisma.mail.findMany({
        where: {
            thread_id: threadId,
            OR: [{ sender_cnid: userCnid }, { recipient_cnid: userCnid }],
        },
        orderBy: { sent_at: "asc" },
        include: {
            sender: {
                include: {
                    studentProfile: { select: { name: true } },
                    universityProfile: { select: { name: true } },
                    companyProfile: { select: { name: true } },
                    recruiterProfile: { select: { name: true } },
                },
            },
            recipient: {
                include: {
                    studentProfile: { select: { name: true } },
                    universityProfile: { select: { name: true } },
                    companyProfile: { select: { name: true } },
                    recruiterProfile: { select: { name: true } },
                },
            },
        },
    });

    if (mails.length === 0) {
        throw new ApiError(404, "Thread not found or you do not have access");
    }

    const unreadMails = mails.filter(
        (m) => m.recipient_cnid === userCnid && !m.is_read
    );

    if (unreadMails.length > 0) {
        await prisma.mail.updateMany({
            where: {
                id: { in: unreadMails.map((m) => m.id) },
            },
            data: { is_read: true },
        });
        invalidateUnreadCountCache(userCnid);
    }

    return mails.map((mail) => {
        let senderName = mail.sender_cnid;
        if (mail.sender) {
            if (mail.sender.studentProfile) senderName = mail.sender.studentProfile.name;
            else if (mail.sender.universityProfile) senderName = mail.sender.universityProfile.name;
            else if (mail.sender.companyProfile) senderName = mail.sender.companyProfile.name;
            else if (mail.sender.recruiterProfile) senderName = mail.sender.recruiterProfile.name;
        }

        let recipientName = mail.recipient_cnid;
        if (mail.recipient) {
            if (mail.recipient.studentProfile) recipientName = mail.recipient.studentProfile.name;
            else if (mail.recipient.universityProfile) recipientName = mail.recipient.universityProfile.name;
            else if (mail.recipient.companyProfile) recipientName = mail.recipient.companyProfile.name;
            else if (mail.recipient.recruiterProfile) recipientName = mail.recipient.recruiterProfile.name;
        }

        return {
            id: mail.id,
            sender_cnid: mail.sender_cnid,
            sender_name: senderName,
            recipient_cnid: mail.recipient_cnid,
            recipient_name: recipientName,
            subject: mail.subject,
            body: mail.body,
            sent_at: mail.sent_at,
            is_read: mail.is_read,
            thread_id: mail.thread_id,
            parent_mail_id: mail.parent_mail_id,
        };
    });
}

export async function markAsRead(
    userCnid: string,
    mailId: string
): Promise<void> {
    const mail = await prisma.mail.findUnique({
        where: { id: mailId },
    });

    if (!mail) {
        throw new ApiError(404, "Mail not found");
    }

    if (mail.recipient_cnid !== userCnid) {
        throw new ApiError(403, "Only the recipient can mark a mail as read");
    }

    await prisma.mail.update({
        where: { id: mailId },
        data: { is_read: true },
    });

    invalidateUnreadCountCache(userCnid);
}

export async function deleteMail(
    userCnid: string,
    mailId: string
): Promise<void> {
    const mail = await prisma.mail.findUnique({
        where: { id: mailId },
    });

    if (!mail) {
        throw new ApiError(404, "Mail not found");
    }

    if (mail.sender_cnid !== userCnid && mail.recipient_cnid !== userCnid) {
        throw new ApiError(403, "You do not have access to this mail");
    }

    if (mail.sender_cnid === userCnid) {
        await prisma.mail.update({
            where: { id: mailId },
            data: { is_deleted_sender: true },
        });
    }

    if (mail.recipient_cnid === userCnid) {
        await prisma.mail.update({
            where: { id: mailId },
            data: { is_deleted_recipient: true },
        });
        invalidateUnreadCountCache(userCnid);
    }
}

export async function getUnreadCount(userCnid: string): Promise<number> {
    const cached = getCachedUnreadCount(userCnid);
    if (cached !== null) {
        return cached;
    }

    const count = await prisma.mail.count({
        where: {
            recipient_cnid: userCnid,
            is_read: false,
            is_deleted_recipient: false,
        },
    });

    setCachedUnreadCount(userCnid, count);
    return count;
}

const SEARCH_RATE_LIMIT = 30;
const SEARCH_RATE_WINDOW_MS = 60 * 1000;

const searchRateLimit = new Map<string, { count: number; windowStart: number }>();

function checkSearchRateLimit(cnid: string): void {
    const now = Date.now();
    const record = searchRateLimit.get(cnid);

    if (!record || now - record.windowStart > SEARCH_RATE_WINDOW_MS) {
        searchRateLimit.set(cnid, { count: 1, windowStart: now });
        return;
    }

    if (record.count >= SEARCH_RATE_LIMIT) {
        throw new ApiError(
            429,
            `Rate limit exceeded. You can search up to ${SEARCH_RATE_LIMIT} times per minute.`
        );
    }

    record.count++;
}

export async function searchRecipients(
    userCnid: string,
    userRole: Role,
    query: string
): Promise<UserDisplayInfo[]> {
    checkSearchRateLimit(userCnid);

    const allowedRoles = getAllowedRecipients(userRole);

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { cnid: { contains: query.toUpperCase() } },
                { studentProfile: { name: { contains: query, mode: "insensitive" } } },
                { universityProfile: { name: { contains: query, mode: "insensitive" } } },
                { companyProfile: { name: { contains: query, mode: "insensitive" } } },
                { recruiterProfile: { name: { contains: query, mode: "insensitive" } } },
            ],
            role: { in: allowedRoles },
        },
        include: {
            studentProfile: { select: { name: true } },
            universityProfile: { select: { name: true } },
            companyProfile: { select: { name: true } },
            recruiterProfile: { select: { name: true } },
        },
        take: 20,
    });

    return users.map((user) => {
        let displayName = user.cnid || "Unknown";
        if (user.studentProfile) displayName = user.studentProfile.name || displayName;
        else if (user.universityProfile) displayName = user.universityProfile.name || displayName;
        else if (user.companyProfile) displayName = user.companyProfile.name || displayName;
        else if (user.recruiterProfile) displayName = user.recruiterProfile.name || displayName;

        return {
            cnid: user.cnid || "",
            displayName,
            role: user.role.toLowerCase(),
        };
    });
}
