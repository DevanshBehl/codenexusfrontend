import { z } from "zod";

export const createWebinarSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        agenda: z.string().min(10, "Agenda must be at least 10 characters"),
        scheduledDate: z.string().min(1, "Date is required"),
        scheduledTime: z.string().min(1, "Time is required"),
        durationMins: z.number().int().min(15).default(60),
        meetingLink: z.string().url("A valid meeting URL is required"),
        targetUniversityIds: z.array(z.string()).min(1, "Select at least one university"),
    })
});

export type CreateWebinarInput = z.infer<typeof createWebinarSchema>["body"];
