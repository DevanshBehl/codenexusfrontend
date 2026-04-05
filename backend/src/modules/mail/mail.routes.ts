import { RequestHandler, Router } from "express";
import * as mailController from "./mail.controller.js";
import * as mailService from "./mail.service.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { sendMailSchema } from "./mail.schema.js";

const router = Router();

router.post(
    "/send",
    authenticate as RequestHandler,
    validate(sendMailSchema) as RequestHandler,
    mailController.sendMail as RequestHandler
);

router.get("/inbox", authenticate as RequestHandler, mailController.getInbox as RequestHandler);

router.get("/sent", authenticate as RequestHandler, mailController.getSentBox as RequestHandler);

router.get("/unread-count", authenticate as RequestHandler, mailController.getUnreadCount as RequestHandler);

router.get("/search-recipients", authenticate as RequestHandler, mailController.searchRecipients as RequestHandler);

router.get("/events", authenticate as RequestHandler, mailController.subscribeToMailEvents as RequestHandler);

router.get("/:id", authenticate as RequestHandler, mailController.getMailById as RequestHandler);

router.get("/thread/:thread_id", authenticate as RequestHandler, mailController.getThread as RequestHandler);

router.patch("/:id/read", authenticate as RequestHandler, mailController.markAsRead as RequestHandler);

router.delete("/:id", authenticate as RequestHandler, mailController.deleteMail as RequestHandler);

export default router;
