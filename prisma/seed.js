import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // 🔐 Same password for all users
  const commonPasswordHash = await bcrypt.hash("11", saltRounds);

  // =========================
  // SYSTEM OWNER
  // =========================
  const systemOwner = await prisma.user.upsert({
    where: { email: "system@test.com" },
    update: {},
    create: {
      name: "System Owner",
      email: "system@test.com",
      passwordHash: commonPasswordHash,
      role: "SYSTEM_OWNER",
      isVerified: true,
    },
  });

  // =========================
  // BUSINESS OWNER
  // =========================
  const businessOwner = await prisma.user.upsert({
    where: { email: "business@test.com" },
    update: {},
    create: {
      name: "Business Owner",
      email: "business@test.com",
      passwordHash: commonPasswordHash,
      role: "BUSINESS_OWNER",
      isVerified: true,
    },
  });

  // =========================
  // STAFF USER
  // =========================
  const staffUser = await prisma.user.upsert({
    where: { email: "staff@test.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@test.com",
      passwordHash: commonPasswordHash,
      role: "STAFF",
      isVerified: true,
    },
  });

  // =========================
  // CUSTOMER
  // =========================
  const customer = await prisma.customer.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      passwordHash: commonPasswordHash,
      qrCode: "123456", // must be unique
      isVerified: true,
    },
  });

  console.log("✅ Seed completed successfully");
  console.log("🔐 All users password: 11");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
