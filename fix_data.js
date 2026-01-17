
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Attempting to fix invalid enum values in database...");

        // Use executeRawUnsafe to bypass Prisma's strict enum validation
        // Postgres is case sensitive with quotes.
        const result = await prisma.$executeRawUnsafe(
            `UPDATE "User" SET "role" = 'CUSTOMER' WHERE "role" = 'customer'`
        );

        console.log(`Update command executed. Rows affected: ${result}`);

    } catch (error) {
        console.error("Failed to fix data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
