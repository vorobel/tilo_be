import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function waitForDB(maxRetries = 10, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (err) {
            if (attempt === maxRetries) throw err;
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
}
