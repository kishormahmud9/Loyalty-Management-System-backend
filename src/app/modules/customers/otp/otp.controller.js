import { OtpService } from "./otp.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { AppError } from "../../../errorHelper/appError.js";
import prisma from "../../../prisma/client.js";

const sendOtp = async (req, res, next) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: "Email is required",
                data: null,
            });
        }

        await OtpService.sendOtp(prisma, email, name);

        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Customer OTP sent successfully",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: "Email and OTP are required",
                data: null,
            });
        }

        await OtpService.verifyOtp(prisma, email, otp);

        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Customer OTP verified successfully",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const OtpController = {
    sendOtp,
    verifyOtp,
};
