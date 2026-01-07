import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import { redisClient } from "../../config/redis.config.js";
import DevBuildError from "../../lib/DevBuildError.js";

const OTP_EXPIRATION = 2 * 60; // 2 minutes

/* -------------------------------------------------------------------------- */
/*                               HELPERS                                      */
/* -------------------------------------------------------------------------- */

const generateOtp = (length = 6) =>
  crypto.randomInt(10 ** (length - 1), 10 ** length).toString();

/* -------------------------------------------------------------------------- */
/*                               SERVICE                                      */
/* -------------------------------------------------------------------------- */

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
      throw new DevBuildError("User not found", 404);
    }

    if (user.isVerified) {
      throw new DevBuildError("You are already verified", 401);
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
      throw new DevBuildError("User not found", 404);
    }

    if (user.isVerified) {
      throw new DevBuildError("You are already verified", 401);
    }

    const redisKey = `otp:${email}`;
    const savedOtp = await redisClient.get(redisKey);

    if (!savedOtp) {
      throw new DevBuildError("Invalid or expired OTP", 401);
    }

    if (savedOtp !== otp) {
      throw new DevBuildError("Invalid OTP", 401);
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
    await redisClient.del(redisKey);
  },
};
