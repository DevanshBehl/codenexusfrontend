import { Request, Response, NextFunction } from "express";
import * as partnershipService from "./partnership.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const getAllUniversities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await partnershipService.getAllUniversitiesWithStatus(req.user!.id as string);
        res.status(200).json(new ApiResponse(200, data, "Universities fetched"));
    } catch (e) {
        next(e);
    }
};

export const sendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await partnershipService.sendPartnershipRequest(req.user!.id as string, req.body.universityId);
        res.status(201).json(new ApiResponse(201, data, "Partnership request sent"));
    } catch (e) {
        next(e);
    }
};

export const getPending = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await partnershipService.getPendingRequests(req.user!.id as string);
        res.status(200).json(new ApiResponse(200, data, "Pending requests fetched"));
    } catch (e) {
        next(e);
    }
};

export const approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await partnershipService.updatePartnershipStatus(req.user!.id as string, req.params.companyId as string, "APPROVED");
        res.status(200).json(new ApiResponse(200, data, "Partnership approved"));
    } catch (e) {
        next(e);
    }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await partnershipService.updatePartnershipStatus(req.user!.id as string, req.params.companyId as string, "REJECTED");
        res.status(200).json(new ApiResponse(200, data, "Partnership rejected"));
    } catch (e) {
        next(e);
    }
};
