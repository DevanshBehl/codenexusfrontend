import { Request, Response, NextFunction, RequestHandler } from 'express';
// Make sure this import matches your custom Prisma output path!
import { Role } from '../generated/prisma/enums.js';
import { ApiError } from '../utils/api-error.js';

// Notice the `: RequestHandler` added right here
export const authorize = (allowedRoles: Role[]): RequestHandler => {
    return (req, res, next) => {

        // Ensure the authenticate middleware ran first
        if (!req.user) {
            return next(new ApiError(401, 'Unauthorized: User not authenticated'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, 'Forbidden: You do not have permission to perform this action'));
        }

        next();
    };
};