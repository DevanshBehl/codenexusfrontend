import { Request, Response, NextFunction } from "express";
import * as webinarService from "./webinar.service.js";
import { ApiResponse } from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";

export const createWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const webinar = await webinarService.createWebinar(userId as string, req.body);
        res.status(201).json(new ApiResponse(201, webinar, "Webinar scheduled successfully"));
    } catch (e) {
        next(e);
    }
}

export const getWebinars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // If the user is authenticated, optionally filter by their company
        const companyUserId = req.user?.id as string | undefined;
        const webinars = await webinarService.getWebinars(companyUserId);
        res.status(200).json(new ApiResponse(200, webinars, "Webinars fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getAllWebinars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webinars = await webinarService.getWebinars();
        res.status(200).json(new ApiResponse(200, webinars, "Webinars fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getWebinarById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webinar = await webinarService.getWebinarById(req.params.id as string);
        res.status(200).json(new ApiResponse(200, webinar, "Webinar fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const webinar = await webinarService.updateWebinar(userId as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, webinar, "Webinar updated successfully"));
    } catch (e) {
        next(e);
    }
}

export const deleteWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        await webinarService.deleteWebinar(userId as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, null, "Webinar deleted successfully"));
    } catch (e) {
        next(e);
    }
}

export const getWebinarAttendees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const attendees = await webinarService.getWebinarAttendees(req.params.id as string);
        res.status(200).json(new ApiResponse(200, attendees, "Attendees fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const joinWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { role } = req.body;
        const attendee = await webinarService.joinWebinar(req.params.id as string, userId as string, role);
        res.status(200).json(new ApiResponse(200, attendee, "Joined webinar successfully"));
    } catch (e) {
        next(e);
    }
}

export const leaveWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const attendee = await webinarService.leaveWebinar(req.params.id as string, userId as string);
        res.status(200).json(new ApiResponse(200, attendee, "Left webinar successfully"));
    } catch (e) {
        next(e);
    }
}

export const getWebinarMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await webinarService.getWebinarMessages(req.params.id as string);
        res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const postWebinarMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { senderName, content, isQuestion } = req.body;
        if (!userId) throw new ApiError(401, "Unauthorized");
        const message = await webinarService.createWebinarMessage(
            req.params.id as string,
            userId,
            senderName || "Anonymous",
            content,
            isQuestion ?? false
        );
        res.status(201).json(new ApiResponse(201, message, "Message sent successfully"));
    } catch (e) {
        next(e);
    }
}
