import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { RegisterSchema, LoginSchema } from "./auth.schema.js";

const router = Router();

router.post("/signup", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login)

export default router;