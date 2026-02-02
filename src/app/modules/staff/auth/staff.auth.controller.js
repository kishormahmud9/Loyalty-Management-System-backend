import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import {
  setStaffPinService,
  staffLoginService,
  staffPinLoginService,
  forgotPinService,
  verifyForgotPinOtpService,
  resetPinService,
} from "./staff.auth.service.js";

export const staffLogin = async (req, res) => {
  try {
    const result = await staffLoginService(req.prisma, req.body);

    if (result.error) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.error,
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Staff login successful",

      data: {
        token: result.token,
        requirePinSetup: result.requirePinSetup,
        branchId: result.branchId,
      },
    });
  } catch (error) {
    console.error("Staff Login Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

export const setStaffPin = async (req, res) => {
  try {
    const result = await setStaffPinService(req.prisma, req.user.id, req.body);

    if (result.error) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.error,
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "PIN set successfully",
      data: null,
    });
  } catch (error) {
    console.error("Set PIN Controller Error:", error.message);
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

export const staffPinLogin = async (req, res) => {
  try {
    const result = await staffPinLoginService(req.prisma, req.body);

    if (result.error) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.error,
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "PIN login successful",
      data: {
        token: result.token,
      },
    });
  } catch (error) {
    console.error("PIN Login Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

export const forgotPin = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Email is required",
        data: null,
      });
    }

    await forgotPinService(req.prisma, email);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "OTP sent to your email",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPinOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Email and OTP are required",
        data: null,
      });
    }

    // Convert OTP to string to ensure strict equality check passes in service
    await verifyForgotPinOtpService(req.prisma, email, String(otp));

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "OTP verified successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPin = async (req, res, next) => {
  try {
    const { email, newPin, confirmPin } = req.body;

    if (!newPin || !confirmPin) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "New PIN and confirm PIN are required",
        data: null,
      });
    }

    await resetPinService(req.prisma, email, newPin, confirmPin);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "PIN reset successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
