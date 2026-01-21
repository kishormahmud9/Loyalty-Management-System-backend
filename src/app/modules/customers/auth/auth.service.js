

import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/client.js";
import { envVars } from "../../../config/env.js";
import { OtpService } from "../otp/otp.service.js";


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
};

export const forgotPasswordService = async (prisma, email) => {
  await prisma.customer.update({
    where: { email },
    data: { forgotPasswordStatus: false },
  });
  await OtpService.sendForgotPasswordOtp(prisma, email);
  return true;
};

