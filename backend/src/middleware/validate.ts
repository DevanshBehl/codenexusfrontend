import express, { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import z, { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";
import { ParsedQs } from "qs";
export const validate = (schema: z.ZodObject) =>
    async (req: Request<ParamsDictionary, any, any, ParsedQs>,
        res: Response,
        next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message
                }))
                next(new ApiError(400, "Validation Failed", errors));
            } else {
                next(error)
            }
        }
    }