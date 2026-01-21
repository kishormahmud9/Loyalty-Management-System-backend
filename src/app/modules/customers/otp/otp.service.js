import crypto from "crypto";
import { sendEmail } from "../../../utils/sendEmail.js";
import { redisClient } from "../../../config/redis.config.js";
import jwt from "jsonwebtoken";
import { envVars } from "../../../config/env.js";
import { AppError } from "../../../errorHelper/appError.js";

const OTP_EXPIRATION = 2 * 60; // 2 minutes

const generateOtp = (length = 6) =>
    crypto.randomInt(10 ** (length - 1), 10 ** length).toString();

export const OtpService = {
    // ✅ Send OTP for Customer
    sendOtp: async (prisma, email, name) => {
        const customer = await prisma.customer.findUnique({
            where: { email },
            select: {
                id: true,
                isVerified: true,
                name: true,
            },
        });

        if (!customer) {
            throw new AppError(404, "Customer not found");
        }

        if (customer.isVerified) {
            throw new AppError(401, "Customer is already verified");
        }

        const otp = generateOtp();
        const redisKey = `customer:otp:${email}`;

        await redisClient.set(redisKey, otp, {
            EX: OTP_EXPIRATION,
        });

        await sendEmail({
            to: email,
            subject: "Customer Verification OTP",
            templateName: "otp",
            templateData: {
                name: name || customer.name,
                otp,
            },
        });
    },

    // ✅ Verify OTP for Customer
    verifyOtp: async (prisma, email, otp) => {
        const customer = await prisma.customer.findUnique({
            where: { email },
            select: {
                id: true,
                isVerified: true,
            },
        });

        if (!customer) {
            throw new AppError(404, "Customer not found");
        }

        if (customer.isVerified) {
            throw new AppError(401, "Customer is already verified");
        }

        const redisKey = `customer:otp:${email}`;
        const savedOtp = await redisClient.get(redisKey);

        if (!savedOtp) {
            throw new AppError(401, "Invalid or expired OTP");
        }

        if (savedOtp !== otp) {
            throw new AppError(401, "Invalid OTP");
        }

        await prisma.customer.update({
            where: { email },
            data: { isVerified: true },
        });
        await redisClient.del(redisKey);
    },

    // ✅ Send Forgot Password OTP for Customer
    sendForgotPasswordOtp: async (prisma, email) => {
        const customer = await prisma.customer.findUnique({
            where: { email },
        });

        if (!customer) {
            throw new AppError(404, "Customer not found");
        }

        if (!customer.isVerified) {
            throw new AppError(401, "Customer is not verified");
        }

        const otp = generateOtp();
        const redisKey = `customer:forgot-password:${email}`;

        await redisClient.set(redisKey, otp, {
            EX: OTP_EXPIRATION,
        });

        await sendEmail({
            to: email,
            subject: "Customer Forgot Password OTP",
            templateName: "forgotPassword",
            templateData: {
                name: customer.name,
                otp,
            },
        });
    },

    // ✅ Verify Forgot Password OTP for Customer
    verifyForgotPasswordOtp: async (prisma, email, otp) => {
        const redisKey = `customer:forgot-password:${email}`;
        const savedOtp = await redisClient.get(redisKey);

        if (!savedOtp || savedOtp !== otp) {
            throw new AppError(401, "Invalid or expired OTP");
        }

        const customer = await prisma.customer.findUnique({
            where: { email },
            select: { id: true, email: true },
        });

        if (!customer) {
            throw new AppError(404, "Customer not found");
        }

        const resetToken = jwt.sign(
            { id: customer.id, email: customer.email, role: "CUSTOMER" },
            envVars.JWT_SECRET_TOKEN,
            { expiresIn: "10m" }
        );

        await prisma.customer.update({
            where: { email },
            data: { forgotPasswordStatus: true },
        });

        await redisClient.del(redisKey);
        return resetToken;
    },
};
