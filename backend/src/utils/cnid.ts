import { prisma } from "../lib/prisma.js";

const PREFIX_MAP = {
    STUDENT: "STU",
    UNIVERSITY: "UNI",
    COMPANY_ADMIN: "COM",
    RECRUITER: "REC",
} as const;

type Role = keyof typeof PREFIX_MAP;

const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const RANDOM_LENGTH = 6;
const MAX_RETRIES = 5;

function generateRandomString(): string {
    let result = "";
    for (let i = 0; i < RANDOM_LENGTH; i++) {
        result += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
    }
    return result;
}

export function generateCnid(role: Role): string {
    const prefix = PREFIX_MAP[role];
    const randomPart = generateRandomString();
    return `CN-${prefix}-${randomPart}`;
}

export async function generateUniqueCnid(role: Role): Promise<string> {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        const cnid = generateCnid(role);
        const existing = await prisma.user.findUnique({
            where: { cnid }
        });
        if (!existing) {
            return cnid;
        }
        retries++;
    }
    throw new Error(`Failed to generate unique CNID after ${MAX_RETRIES} attempts`);
}

export function parseCnidRole(cnid: string): Role | null {
    if (!cnid.startsWith("CN-")) return null;
    const parts = cnid.split("-");
    if (parts.length !== 3) return null;
    const prefix = parts[1];
    for (const [key, value] of Object.entries(PREFIX_MAP)) {
        if (value === prefix) return key as Role;
    }
    return null;
}

export function isValidCnidFormat(cnid: string): boolean {
    return /^CN-(STU|UNI|COM|REC)-[A-Z0-9]{6}$/.test(cnid);
}
