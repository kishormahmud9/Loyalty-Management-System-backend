
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Inspecting enum values...");

        // Check what values are allowed in the enum
        const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"UserRole")) as value
    `;

        console.log("Valid UserRole values in DB:", result);

        // Check the raw role string of the problematic user (cast to text to avoid enum error)
        const users = await prisma.$queryRaw`
      SELECT id, email, role::text as role_str FROM "User" WHERE email = 'ahanaf607307@gmail.com'
    `;
        console.log(" problematic user:", users);

    } catch (error) {
        console.error("Inspection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
