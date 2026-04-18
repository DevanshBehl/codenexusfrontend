import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from "./auth.schema.js";

const router = Router();

router.post("/signup", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);
router.post("/refresh", validate(RefreshTokenSchema), authController.refresh);
router.post("/logout", authController.logout);

export default router;