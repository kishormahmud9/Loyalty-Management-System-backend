import { envVars } from "../../config/env.js";
import { sendEmail } from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { Role } from "../../utils/role.js";

import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import prisma from "../../prisma/client.js";
import { OtpService } from "../otp/otp.service.js";
import { AppError } from "../../errorHelper/appError.js";

export const AuthService = {

  findByEmail: async (prisma, email) =>
    prisma.user.findUnique({ where: { email } }),
  findByUsername: async (prisma, username) =>
    prisma.user.findUnique({ where: { username } }),
  findById: async (prisma, id) => prisma.user.findUnique({ where: { id } }),

  resetPassword: async (payload) => {
    const { id, newPassword } = payload;

    // 2️⃣ Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(StatusCodes.FORBIDDEN, "User does not exist");
    }

    // 2.1️⃣ Check forgotPasswordStatus
    if (!user.forgotPasswordStatus) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Please verify your forgot password OTP first"
      );
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(envVars.BCRYPT_SALT_ROUND || 10)
    );

    // 4️⃣ Update password
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        forgotPasswordStatus: false,
      },
    });

    return true;
  },

  getUserContext: async (prisma, userId, role) => {
    let context = { businessId: null, branchId: null };

    if (role === Role.BUSINESS_OWNER) {
      const business = await prisma.business.findFirst({
        where: { ownerId: userId },
        select: { id: true },
      });
      if (business) {
        context.businessId = business.id;
      }
    } else if (role === Role.STAFF) {
      const staff = await prisma.staff.findUnique({
        where: { userId: userId },
        select: { id: true, businessId: true, branchId: true },
      });
      if (staff) {
        context.staffId = staff.id;
        context.businessId = staff.businessId;
        context.branchId = staff.branchId;
      }
    }

    return context;
  },

  changePassword: async (prisma, id, payload) => {
    const { oldPassword, newPassword } = payload;

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    // 2. Verify old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, "Old password does not match");
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(envVars.BCRYPT_SALT_ROUND || 10)
    );

    // 4. Update password
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return true;
  },
};

export const forgotPasswordService = async (prisma, email) => {
  await prisma.user.update({
    where: { email },
    data: { forgotPasswordStatus: false },
  });
  await OtpService.sendForgotPasswordOtp(prisma, email);
  return true;
};
