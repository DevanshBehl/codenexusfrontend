import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId,
            expiresAt,
        }
    });
}

export async function validateRefreshToken(token: string): Promise<{ userId: string } | null> {
    const tokenHash = hashToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash }
    });

    if (!storedToken) {
        return null;
    }

    if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        return null;
    }

    return { userId: storedToken.userId };
}

export async function deleteRefreshToken(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await prisma.refreshToken.deleteMany({
        where: { tokenHash }
    });
}

export async function deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
        where: { userId }
    });
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

    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            cnid: user.cnid
        },
        token,
        refreshToken
    }
}

export const refreshAccessToken = async (refreshToken: string) => {
    const payload = await validateRefreshToken(refreshToken);
    if (!payload) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId }
    });

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    const newAccessToken = jwt.sign({
        id: user.id,
        role: user.role,
        cnid: user.cnid
    }, env.JWT_SECRET, {
        expiresIn: "1d"
    });

    const newRefreshToken = generateRefreshToken();
    await deleteRefreshToken(refreshToken);
    await saveRefreshToken(user.id, newRefreshToken);

    return {
        token: newAccessToken,
        refreshToken: newRefreshToken
    };
}