import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function waitForDB(
    maxRetries = 10,
    delayMs = 2000
): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            console.log('✅ Database is up and reachable');
            return;
        } catch (err) {
            console.log(
                `⚠️ DB not ready yet (attempt ${attempt}/${maxRetries})`
            );

            if (attempt === maxRetries) {
                console.error('❌ Giving up on DB connection');
                throw err;
            }

            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}
