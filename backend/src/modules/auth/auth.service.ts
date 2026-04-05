import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { RegisterInput, LoginInput } from "./auth.schema.js";
import { ApiError } from "../../utils/api-error.js";
import { generateUniqueCnid } from "../../utils/cnid.js";

export const registerUser = async (data: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    })
    if (existingUser) {
        throw new ApiError(409, "Email is already in use");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const cnid = await generateUniqueCnid(data.role);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            role: data.role,
            cnid,
        }, select: {
            id: true,
            email: true,
            role: true,
            cnid: true,
            createdAt: true
        }
    });
    return user;
}

export const loginUser = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })
    if (!user) {
        throw new ApiError(401, "Invalid email or password")
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password")

    }
    const token = jwt.sign({
        id: user.id,
        role: user.role,
        cnid: user.cnid
    }, env.JWT_SECRET, {
        expiresIn: "1d"
    })
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            cnid: user.cnid
        }, token
    }
}