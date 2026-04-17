import { RequestHandler, Router } from "express";
import * as evaluationController from "./evaluation.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate as RequestHandler);

router.get(
    "/company",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    evaluationController.getCompanyEvaluations as RequestHandler
);

router.get(
    "/company/:interviewId",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    evaluationController.getEvaluationDetail as RequestHandler
);

router.patch(
    "/:interviewId",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    evaluationController.submitEvaluation as RequestHandler
);

export default router;