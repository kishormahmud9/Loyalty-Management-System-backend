import { OtpService } from "./otp.service.js";

import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../errorHelper/appError.js";

//        SEND OTP   

const sendOtp = async (req, res) => {
  try {
    const prisma = req.prisma;
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
      message: "OTP sent successfully",
      data: null,
    });
  } catch (error) {
    console.error("sendOtp error:", error);

    if (error instanceof AppError) {
      return sendResponse(res, {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to send OTP",
      data: null,
    });
  }
};


//     VERIFY OTP      


const verifyOtp = async (req, res) => {
  try {
    const prisma = req.prisma;
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
      message: "OTP verified successfully",
      data: null,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);

    if (error instanceof AppError) {
      return sendResponse(res, {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to verify OTP",
      data: null,
    });
  }
};


export const OtpController = {
  sendOtp,
  verifyOtp,
};
