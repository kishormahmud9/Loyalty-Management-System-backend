
import bcrypt from "bcrypt";
import { generateSixDigitCode, generateAndSaveQRCode } from "../../../utils/qrGenerator.js";
import { envVars } from "../../../config/env.js";
import { AppError } from "../../../errorHelper/appError.js";

export const CustomerService = {

  // BASIC FIND METHODS

  findByEmail: async (prisma, email) =>
    prisma.customer.findUnique({ where: { email } }),

  findById: async (prisma, id) =>
    prisma.customer.findUnique({ where: { id } }),


  // ✅ ONLY CUSTOMER INFO

  findCustomerInfoById: async (prisma, id) =>
    prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        qrCode: true,
        qrCodePath: true,
        qrCodeUrl: true,
        qrScanner: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),


  // UPDATE / DELETE

  update: async (prisma, id, data) =>
    prisma.customer.update({
      where: { id },
      data,
    }),

  delete: async (prisma, id) =>
    prisma.customer.delete({
      where: { id },
    }),

  // Customer + Branch Data
  findByIdWithBranches: async (prisma, id) =>
    prisma.customer.findUnique({
      where: { id },
      include: {
        branchData: {
          include: {
            business: true,
            branch: true
          }
        }
      }
    }),


  // Register Customer to a Branch
  registerToBranch: async (prisma, customerId, businessId, branchId) => {
    // 1. Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    if (!business) {
      throw new AppError(404, "Business not found");
    }

    // 2. Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    if (!branch) {
      throw new AppError(404, "Branch not found");
    }

    // 3. Check if branch belongs to the business
    if (branch.businessId !== businessId) {
      throw new AppError(400, "Branch does not belong to the specified business");
    }

    // 4. Check if already registered
    const existingRegistration = await prisma.customerBranchData.findUnique({
      where: {
        customerId_branchId: {
          customerId,
          branchId
        }
      }
    });

    if (existingRegistration) {
      throw new AppError(400, "Customer is already registered at this branch");
    }

    // 5. Create registration and initial reward history in a transaction
    return prisma.$transaction(async (tx) => {
      const registration = await tx.customerBranchData.create({
        data: {
          customerId,
          businessId,
          branchId
        }
      });

      await tx.rewardHistory.create({
        data: {
          customerId,
          businessId,
          branchId,
          rewardPoints: 0,
          activeRewards: 0,
          availableRewards: 0
        }
      });

      return registration;
    });
  }
};


export const createCustomerService = async (payload) => {
  const { prisma, email, password, picture, ...rest } = payload;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  // Check if customer already exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (existingCustomer) {
    throw new AppError(400, "Customer already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND || 10)
  );

  // Generate 6-digit QR code
  const qrCode = generateSixDigitCode();

  // Generate and save QR code image
  const qrCodePath = await generateAndSaveQRCode(qrCode, `customer-${qrCode}-${Date.now()}`);

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      email,
      name: rest.name || email.split('@')[0],
      passwordHash: hashedPassword,
      avatarUrl: picture,
      isVerified: false,
      qrCode,
      qrCodePath,
      qrCodeUrl: `${envVars.SERVER_URL}/${qrCodePath}`,
      ...rest,
    },
  });

  return customer;
};




