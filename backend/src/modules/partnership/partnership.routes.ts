import { RequestHandler, Router } from "express";
import * as partnershipController from "./partnership.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate as RequestHandler);

router.get("/universities",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    partnershipController.getAllUniversities as RequestHandler
);

router.post("/request",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    partnershipController.sendRequest as RequestHandler
);

router.get("/pending",
    authorize(["UNIVERSITY"]) as RequestHandler,
    partnershipController.getPending as RequestHandler
);

router.patch("/:companyId/approve",
    authorize(["UNIVERSITY"]) as RequestHandler,
    partnershipController.approve as RequestHandler
);

router.patch("/:companyId/reject",
    authorize(["UNIVERSITY"]) as RequestHandler,
    partnershipController.reject as RequestHandler
);

export default router;
