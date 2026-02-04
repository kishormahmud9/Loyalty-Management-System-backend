import { envVars } from "../../config/env.js";

import bcrypt from "bcrypt";
import { Role } from "../../utils/role.js";
import { AppError } from "../../errorHelper/appError.js";

export const UserService = {

  // BASIC FIND METHODS

  findByEmail: async (prisma, email) =>
    prisma.user.findUnique({ where: { email } }),

  findByUsername: async (prisma, username) =>
    prisma.user.findUnique({ where: { username } }),

  findById: async (prisma, id) =>
    prisma.user.findUnique({ where: { id } }),


  // ✅ ONLY USER INFO (NO PROFILE)

  findUserInfoById: async (prisma, id) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),


  // UPDATE / DELETE

  update: async (prisma, id, data) =>
    prisma.user.update({
      where: { id },
      data,
    }),

  delete: async (prisma, id) =>
    prisma.user.delete({
      where: { id },
    }),


  // USER + FULL PROFILE

  findByIdWithProfile: async (prisma, id) =>
    prisma.user.findUnique({
      where: { id },
    }),

  findAllWithProfile: async (prisma) =>
    prisma.user.findMany({}),
};


export const createUserService = async (payload) => {
  const { prisma, email, password, picture, role, ...rest } = payload;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(400, "User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND || 10)
  );

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      avatarUrl: picture,
      isVerified: false,
      role: role || Role.CUSTOMER, // Use provided role or default to CUSTOMER
      oauthProvider: "email",
      ...rest,
    },
  });

  return user;
};



