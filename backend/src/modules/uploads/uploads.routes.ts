import { Router, RequestHandler } from "express";
import { upload } from "./multer.js";
import { authenticate } from "../../middleware/authenticate.js";
import * as uploadsController from "./uploads.controller.js";

const router = Router();

router.post("/avatar", authenticate as RequestHandler, upload.single("file"), uploadsController.uploadAvatar);
router.post("/project-image", authenticate as RequestHandler, upload.single("file"), uploadsController.uploadProjectImage);

export default router;