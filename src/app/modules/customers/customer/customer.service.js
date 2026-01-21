
import bcrypt from "bcrypt";
import { generateSixDigitCode } from "../../../utils/qrGenerator.js";
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
    return prisma.customerBranchData.upsert({
      where: {
        customerId_branchId: {
          customerId,
          branchId
        }
      },
      update: {}, // No updates needed if already exists
      create: {
        customerId,
        businessId,
        branchId
      }
    });
  }
};


export const createCustomerService = async (payload) => {
  const { prisma, email, password, picture, businessId, branchId, ...rest } = payload;

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

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      email,
      name: rest.name || email.split('@')[0],
      passwordHash: hashedPassword,
      avatarUrl: picture,
      isVerified: false,
      qrCode,
      ...rest,
    },
  });

  // If business and branch provided, register them
  if (businessId && branchId) {
    await CustomerService.registerToBranch(prisma, customer.id, businessId, branchId);
  }

  return customer;
};




