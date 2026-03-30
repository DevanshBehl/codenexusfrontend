import { RequestHandler, Router } from "express";
import * as webinarController from "./webinar.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createWebinarSchema } from "./webinar.schema.js";

const router = Router();

// Public routes
router.get("/", webinarController.getAllWebinars as RequestHandler);
router.get("/:id", webinarController.getWebinarById as RequestHandler);

// Protected routes - company users can see their own webinars
router.get("/my/list",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    webinarController.getWebinars as RequestHandler
);

// Create webinar (COMPANY_ADMIN only)
router.post("/",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    validate(createWebinarSchema) as RequestHandler,
    webinarController.createWebinar as RequestHandler
);

export default router;
