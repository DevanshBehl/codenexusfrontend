import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "./api-error.js";
import { parseCnidRole } from "./cnid.js";

const PERMISSION_MATRIX: Record<string, string[]> = {
    STUDENT: ["UNIVERSITY"],
    UNIVERSITY: ["STUDENT", "COMPANY_ADMIN"],
    COMPANY_ADMIN: ["STUDENT", "UNIVERSITY", "RECRUITER"],
    RECRUITER: ["COMPANY_ADMIN"],
};

export function canSendMail(senderRole: Role, recipientRole: Role): boolean {
    const allowedRecipients = PERMISSION_MATRIX[senderRole];
    if (!allowedRecipients) return false;
    return allowedRecipients.includes(recipientRole);
}

export function getAllowedRecipients(senderRole: Role): Role[] {
    return (PERMISSION_MATRIX[senderRole] || []) as Role[];
}

export async function validateMailPermission(
    senderCnid: string,
    recipientCnid: string
): Promise<{ valid: boolean; senderRole?: Role; recipientRole?: Role; error?: string }> {
    const senderRole = parseCnidRole(senderCnid);
    const recipientRole = parseCnidRole(recipientCnid);

    if (!senderRole) {
        return { valid: false, error: "Invalid sender CNID format" };
    }
    if (!recipientRole) {
        return { valid: false, error: "Invalid recipient CNID format" };
    }

    const recipientUser = await prisma.user.findUnique({
        where: { cnid: recipientCnid }
    });

    if (!recipientUser) {
        return { valid: false, error: "Recipient CNID does not exist" };
    }

    const recipientActualRole = recipientUser.role;
    const recipientActualRoleStr = recipientActualRole as string;

    if (!canSendMail(senderRole, recipientActualRoleStr as Role)) {
        return {
            valid: false,
            senderRole,
            recipientRole: recipientActualRoleStr as Role,
            error: `Your role (${senderRole}) cannot send mail to ${recipientActualRoleStr}`,
        };
    }

    return {
        valid: true,
        senderRole,
        recipientRole: recipientActualRoleStr as Role,
    };
}

export function checkMailPermission(senderRole: Role, recipientRole: Role): void {
    if (!canSendMail(senderRole, recipientRole)) {
        throw new ApiError(
            403,
            `Permission denied: Your role (${senderRole}) cannot send mail to this recipient role (${recipientRole})`
        );
    }
}

export async function logPermissionViolation(
    senderCnid: string,
    attemptedRecipientCnid: string,
    action: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    try {
        await prisma.mailPermissionViolation.create({
            data: {
                sender_cnid: senderCnid,
                attempted_recipient_cnid: attemptedRecipientCnid,
                action,
                ip_address: ipAddress || null,
                user_agent: userAgent || null,
            },
        });
    } catch (error) {
        console.error("Failed to log permission violation:", error);
    }
}
