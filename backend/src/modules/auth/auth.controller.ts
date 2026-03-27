import { Request, Response, NextFunction } from "express";
import * as authService from './auth.service.js';
import { ApiResponse } from "../../utils/api-response.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
    } catch (e) {
        next(e);
    }
}
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(201).json(new ApiResponse(200, result, "User logged in successfully"))
    } catch (e) {
        next(e);
    }
}
