import { z } from "zod";

export const sendMailSchema = z.object({
    body: z.object({
        recipient_cnid: z.string().min(1, "Recipient CNID is required"),
        subject: z.string().min(1, "Subject is required").max(200, "Subject must not exceed 200 characters"),
        body: z.string().min(1, "Body is required").max(5000, "Body must not exceed 5000 characters"),
        parent_mail_id: z.string().uuid().optional(),
    }),
});

export const getMailParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid mail ID"),
    }),
});

export const getThreadParamsSchema = z.object({
    params: z.object({
        thread_id: z.string().uuid("Invalid thread ID"),
    }),
});

export const paginationQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().transform((val) => parseInt(val || "1", 10)),
        limit: z.string().optional().transform((val) => parseInt(val || "20", 10)),
    }),
});

export const searchRecipientsQuerySchema = z.object({
    query: z.object({
        q: z.string().min(1, "Search query is required").max(100, "Query too long"),
    }),
});

export type SendMailInput = z.infer<typeof sendMailSchema>["body"];
export type PaginationQuery = z.infer<typeof paginationQuerySchema>["query"];
export type SearchRecipientsQuery = z.infer<typeof searchRecipientsQuerySchema>["query"];
