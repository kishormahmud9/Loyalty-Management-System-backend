import { PrismaClient, StaffRole, SubscriptionStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if seed has already run by looking for the system owner
  const existingSystemOwner = await prisma.user.findUnique({
    where: { email: "system@test.com" },
  });

  if (existingSystemOwner) {
    console.log("ℹ️ seed data already exist");
    return;
  }

  console.log("🌱 Starting seeding...");
  const saltRounds = 10;
  const commonPasswordHash = await bcrypt.hash("11", saltRounds);

  //
  // 1️⃣ PLAN
  //
  const plan = await prisma.plan.upsert({
    where: { name: "Test 001" },
    update: {},
    create: {
      name: "Test 001",
      monthlyPrice: 50,
      yearlyPrice: 600,
      maxBranches: 5,
      maxStaff: 10,
      maxCards: 3,
      stripeMonthlyPriceId: "price_1Sw2xZFGnkh5CEazgaKnZewu",
      stripeYearlyPriceId: "price_1Sw2xmFGnkh5CEazHv9rwbdI",
    },
  });

  //
  // 2️⃣ SYSTEM OWNER
  //
  await prisma.user.upsert({
    where: { email: "system@test.com" },
    update: {},
    create: {
      name: "System Owner",
      email: "system@test.com",
      passwordHash: commonPasswordHash,
      role: UserRole.SYSTEM_OWNER,
      isVerified: true,
    },
  });

  //
  // 3️⃣ BUSINESS OWNER
  //
  const businessOwner = await prisma.user.upsert({
    where: { email: "business@test.com" },
    update: {},
    create: {
      name: "Business Owner",
      email: "business@test.com",
      passwordHash: commonPasswordHash,
      role: UserRole.BUSINESS_OWNER,
      isVerified: true,
    },
  });

  //
  // 4️⃣ BUSINESS
  //
  let business = await prisma.business.findUnique({
    where: { qrCode: "BUSINESS123" }
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: "Test Business",
        ownerId: businessOwner.id,
        qrCode: "BUSINESS123",
        city: "Dhaka",
        country: "Bangladesh",
      },
    });
  }

  //
  // 5️⃣ BRANCH
  //
  let branch = await prisma.branch.findFirst({
    where: { businessId: business.id }
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: "Main Branch",
        address: "Dhaka Main Road",
        city: "Dhaka",
        country: "Bangladesh",
        businessId: business.id,
      },
    });
  }

  //
  // 6️⃣ STAFF USER
  //
  const staffUser = await prisma.user.upsert({
    where: { email: "staff@test.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@test.com",
      passwordHash: commonPasswordHash,
      role: UserRole.STAFF,
      isVerified: true,
    },
  });

  const existingStaff = await prisma.staff.findFirst({
    where: { userId: staffUser.id }
  });

  if (!existingStaff) {
    await prisma.staff.create({
      data: {
        userId: staffUser.id,
        businessId: business.id,
        branchId: branch.id,
        role: StaffRole.MANAGER,
      },
    });
  }

  //
  // 7️⃣ CUSTOMER
  //
  await prisma.customer.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      passwordHash: commonPasswordHash,
      qrCode: "CUSTOMER123",
      isVerified: true,
    },
  });

  //
  // 8️⃣ BUSINESS SUBSCRIPTION
  //
  const existingSubscription = await prisma.businessSubscription.findFirst({
    where: { businessId: business.id }
  });

  if (!existingSubscription) {
    await prisma.businessSubscription.create({
      data: {
        businessId: business.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        planName: plan.name,
        price: plan.monthlyPrice,
        maxBranches: plan.maxBranches,
        maxCards: plan.maxCards,
        maxStaff: plan.maxStaff,
      },
    });
  }

  console.log("✅ Full Seed Completed Successfully");
  console.log("🔐 All passwords: 11");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
