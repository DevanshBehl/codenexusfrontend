import { Request, Response, NextFunction } from "express";
import * as mailService from "./mail.service.js";
import { ApiResponse } from "../../utils/api-response.js";
import { Role } from "../../generated/prisma/enums.js";
import { logPermissionViolation } from "../../utils/permission-matrix.js";
import { parseCnidRole } from "../../utils/cnid.js";
import { setupSSEHeaders, sseManager } from "./mail.sse.js";

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: Role;
        cnid?: string;
    };
}

export const sendMail = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const { recipient_cnid, subject, body, parent_mail_id } = req.body;

        const mail = await mailService.sendMail(
            senderCnid,
            req.user.role,
            recipient_cnid,
            subject,
            body,
            parent_mail_id
        );

        res.status(201).json(
            new ApiResponse(201, mail, "Mail sent successfully")
        );
    } catch (error: any) {
        if (error.statusCode === 403) {
            const senderCnid = req.user.cnid || "unknown";
            const recipientCnid = req.body.recipient_cnid || "unknown";
            logPermissionViolation(
                senderCnid,
                recipientCnid,
                "send_mail",
                req.ip,
                req.get("user-agent")
            );
        }
        next(error);
    }
};

export const getInbox = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await mailService.getInbox(senderCnid, page, limit);

        res.status(200).json(
            new ApiResponse(200, result, "Inbox fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

export const getSentBox = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await mailService.getSentBox(senderCnid, page, limit);

        res.status(200).json(
            new ApiResponse(200, result, "Sent box fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

export const getMailById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const mailId = req.params.id as string;
        const mail = await mailService.getMailById(senderCnid, mailId);

        res.status(200).json(
            new ApiResponse(200, mail, "Mail fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

export const getThread = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const threadId = req.params.thread_id as string;
        const mails = await mailService.getThread(senderCnid, threadId);

        res.status(200).json(
            new ApiResponse(200, mails, "Thread fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const mailId = req.params.id as string;
        await mailService.markAsRead(senderCnid, mailId);

        res.status(200).json(
            new ApiResponse(200, null, "Mail marked as read")
        );
    } catch (error) {
        next(error);
    }
};

export const deleteMail = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const mailId = req.params.id as string;
        await mailService.deleteMail(senderCnid, mailId);

        res.status(200).json(
            new ApiResponse(200, null, "Mail deleted successfully")
        );
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const count = await mailService.getUnreadCount(senderCnid);

        res.status(200).json(
            new ApiResponse(200, { unread_count: count }, "Unread count fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

export const searchRecipients = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const query = req.query.q as string;
        const results = await mailService.searchRecipients(
            senderCnid,
            req.user.role,
            query
        );

        res.status(200).json(
            new ApiResponse(200, results, "Recipients found")
        );
    } catch (error) {
        next(error);
    }
};

export const subscribeToMailEvents = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const senderCnid = req.user.cnid;
        if (!senderCnid) {
            throw new Error("User CNID not found");
        }

        const headers = setupSSEHeaders();
        for (const [key, value] of Object.entries(headers)) {
            res.setHeader(key, value);
        }

        res.write("event: connected\ndata: {}\n\n");

        sseManager.addClient(senderCnid, res);

        req.on("close", () => {
            sseManager.removeClient(senderCnid, res);
        });

        req.on("error", () => {
            sseManager.removeClient(senderCnid, res);
        });
    } catch (error) {
        next(error);
    }
};
