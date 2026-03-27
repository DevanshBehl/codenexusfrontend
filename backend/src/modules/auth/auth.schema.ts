import { z } from "zod";
import { Role } from "../../generated/prisma/enums.js";

export const RegisterSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Passord must be 8 characters long"),
        role: z.nativeEnum(Role, {
            message: "Invalid role provided"
        })
    })
})
export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
})

export type RegisterInput = z.infer<typeof RegisterSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];