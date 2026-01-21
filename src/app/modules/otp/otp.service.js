import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import { redisClient } from "../../config/redis.config.js";

import jwt from "jsonwebtoken";
import { envVars } from "../../config/env.js";
import { AppError } from "../../errorHelper/appError.js";

const OTP_EXPIRATION = 2 * 60; // 2 minutes

// HELPERS for OTP generation

const generateOtp = (length = 6) =>
  crypto.randomInt(10 ** (length - 1), 10 ** length).toString();


export const OtpService = {
  // ✅ Send OTP
  sendOtp: async (prisma, email, name) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isVerified: true,
        name: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.isVerified) {
      throw new AppError(401, "You are already verified");
    }

    const otp = generateOtp();
    const redisKey = `otp:${email}`;

    await redisClient.set(redisKey, otp, {
      EX: OTP_EXPIRATION,
    });

    await sendEmail({
      to: email,
      subject: "Verification OTP",
      templateName: "otp",
      templateData: {
        name: name || user.name,
        otp,
      },
    });
  },

  // ✅ Verify OTP
  verifyOtp: async (prisma, email, otp) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.isVerified) {
      throw new AppError(401, "You are already verified");
    }

    const redisKey = `otp:${email}`;
    const savedOtp = await redisClient.get(redisKey);

    if (!savedOtp) {
      throw new AppError(401, "Invalid or expired OTP");
    }

    if (savedOtp !== otp) {
      throw new AppError(401, "Invalid OTP");
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
    await redisClient.del(redisKey);
  },

  // ✅ Send Forgot Password OTP
  sendForgotPasswordOtp: async (prisma, email) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (!user.isVerified) {
      throw new AppError(401, "User is not verified");
    }

    const otp = generateOtp();
    const redisKey = `forgot-password:${email}`;

    await redisClient.set(redisKey, otp, {
      EX: OTP_EXPIRATION,
    });

    await sendEmail({
      to: email,
      subject: "Forgot Password OTP",
      templateName: "forgotPassword",
      templateData: {
        name: user.name,
        otp,
      },
    });
  },

  // ✅ Verify Forgot Password OTP & Return Token
  verifyForgotPasswordOtp: async (prisma, email, otp) => {
    const redisKey = `forgot-password:${email}`;
    const savedOtp = await redisClient.get(redisKey);

    if (!savedOtp || savedOtp !== otp) {
      throw new AppError(401, "Invalid or expired OTP");
    }

    // OTP is valid, generate a short-lived reset token
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      envVars.JWT_SECRET_TOKEN,
      { expiresIn: "10m" }
    );

    await prisma.user.update({
      where: { email },
      data: { forgotPasswordStatus: true },
    });

    await redisClient.del(redisKey);
    return resetToken;
  },
};
