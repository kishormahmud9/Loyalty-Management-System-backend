
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking for users...");
        // Try to find raw data or just find many to see if it crashes
        // We cannot easily bypass Prisma's type validation on findMany if we select the role field.
        // So let's try to select only id and email first.
        const usersBasic = await prisma.user.findMany({
            select: { id: true, email: true } // Don't select role
        });
        console.log(`Found ${usersBasic.length} users (id/email only).`);

        // Now try to include role for one of them
        for (const u of usersBasic) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: u.id },
                });
                console.log(`User ${u.email} loaded successfully. Role: ${user.role}`);
            } catch (e) {
                console.error(`Failed to load user ${u.email}:`, e.message);
            }
        }

    } catch (error) {
        console.error("Global crash:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
