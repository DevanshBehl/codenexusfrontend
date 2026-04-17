import { z } from 'zod';

export const submitEvaluationSchema = z.object({
    verdict: z.enum(['SELECTED', 'REJECTED', 'HOLD']),
    notes: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    technicalScore: z.number().int().min(1).max(5).optional(),
    communicationScore: z.number().int().min(1).max(5).optional(),
    cultureScore: z.number().int().min(1).max(5).optional(),
});

export type SubmitEvaluationInput = z.infer<typeof submitEvaluationSchema>;