

import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/client.js";
import { envVars } from "../../../config/env.js";
import { OtpService } from "../otp/otp.service.js";
import { AppError } from "../../../errorHelper/appError.js";


export const AuthService = {

  findByEmail: async (prisma, email) =>
    prisma.customer.findUnique({ where: { email } }),

  findById: async (prisma, id) => prisma.customer.findUnique({ where: { id } }),

  resetPassword: async (payload) => {
    const { id, newPassword } = payload;

    // 2️⃣ Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new AppError(StatusCodes.FORBIDDEN, "Customer does not exist");
    }

    // 2.1️⃣ Check forgotPasswordStatus
    if (!customer.forgotPasswordStatus) {
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
    await prisma.customer.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        forgotPasswordStatus: false,
      },
    });

    return true;
  },

  changePassword: async (prisma, id, payload) => {
    const { oldPassword, newPassword } = payload;

    // 1. Find customer
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new AppError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    // 2. Verify old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, customer.passwordHash);
    if (!isPasswordMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, "Old password does not match");
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(envVars.BCRYPT_SALT_ROUND || 10)
    );

    // 4. Update password
    await prisma.customer.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return true;
  },
};

export const forgotPasswordService = async (prisma, email) => {
  await prisma.customer.update({
    where: { email },
    data: { forgotPasswordStatus: false },
  });
  await OtpService.sendForgotPasswordOtp(prisma, email);
  return true;
};

