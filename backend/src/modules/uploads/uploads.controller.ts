import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs/promises";
import { ApiError } from "../../utils/api-error.js";
import { ApiResponse } from "../../utils/api-response.js";
import { prisma } from "../../lib/prisma.js";
import sharp from "sharp";

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "No file uploaded");
        }

        const filename = req.file.filename;
        const resizedFilename = `resized_${filename}`;
        const resizedPath = path.join(req.file.destination, resizedFilename);

        await sharp(req.file.path)
            .resize(256, 256, { fit: "cover" })
            .toFile(resizedPath);

        // Delete the original un-resized file
        await fs.unlink(req.file.path);

        const avatarUrl = `/uploads/avatars/${resizedFilename}`;

        await prisma.student.update({
            where: { userId: req.user!.id },
            data: { avatarUrl },
        });

        res.status(200).json(new ApiResponse(200, { avatarUrl }, "Avatar uploaded successfully"));
    } catch (e) {
        // Clean up original file if something went wrong
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(e);
    }
};

export const uploadProjectImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "No file uploaded");
        }

        const filename = req.file.filename;
        const resizedFilename = `resized_${filename}`;
        const resizedPath = path.join(req.file.destination, resizedFilename);

        await sharp(req.file.path)
            .resize(800, 600, { fit: "inside", withoutEnlargement: true })
            .toFile(resizedPath);

        // Delete the original un-resized file
        await fs.unlink(req.file.path);

        const imageUrl = `/uploads/projects/${resizedFilename}`;

        res.status(200).json(new ApiResponse(200, { imageUrl }, "Project image uploaded successfully"));
    } catch (e) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(e);
    }
};
