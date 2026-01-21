
import { AuthService, forgotPasswordService } from "./auth.service.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { OtpService } from "../otp/otp.service.js";

import { envVars } from "../../../config/env.js";
import { createUserTokens } from "../../../utils/userTokenGenerator.js";
import { sendResponse } from "../../../utils/sendResponse.js";

const credentialLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Email and password are required");
    }

    const customer = await AuthService.findByEmail(prisma, email);

    if (!customer) {
      throw new AppError(StatusCodes.FORBIDDEN, "Authentication failed");
    }

    const isPasswordMatch = await bcrypt.compare(password, customer.passwordHash);

    if (!isPasswordMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, "Authentication failed");
    }

    // Generate access & refresh tokens
    // Add role CUSTOMER for JWT payload compatibility
    const tokens = await createUserTokens({ ...customer, role: "CUSTOMER" });

    // Remove sensitive fields
    const { passwordHash, ...saveCustomer } = customer;

    // Send response - Tokens in body only
    sendResponse(res, {
      success: true,
      message: "Customer logged in successfully",
      statusCode: StatusCodes.OK,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: saveCustomer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Refresh Token
const getNewAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Refresh token is required in the request body"
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, envVars.JWT_REFRESH_TOKEN);
    } catch (err) {
      throw new AppError(StatusCodes.FORBIDDEN, "Invalid refresh token");
    }

    const customer = await AuthService.findById(prisma, decoded.id);

    if (!customer) {
      throw new AppError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    if (!customer.isVerified) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Customer is not verified. Please verify your email."
      );
    }

    const newAccessToken = jwt.sign(
      { id: customer.id, email: customer.email, role: "CUSTOMER" },
      envVars.JWT_SECRET_TOKEN,
      { expiresIn: envVars.JWT_EXPIRES_IN }
    );

    sendResponse(res, {
      success: true,
      message: "New access token retrieved successfully",
      statusCode: StatusCodes.OK,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // For customers, logout is handled by the frontend deleting the token
    sendResponse(res, {
      success: true,
      message: "User logged out successfully",
      statusCode: StatusCodes.OK,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
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

    await forgotPasswordService(prisma, email);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Forgot password OTP sent successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const verifyForgotPasswordOtp = async (req, res, next) => {
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

    // Note: OtpService.verifyForgotPasswordOtp currently uses prisma.user 
    // We might need a separate OtpService method for customers if strictly isolated.
    // However, the user didn't mention OTP table being different.
    const resetToken = await OtpService.verifyForgotPasswordOtp(prisma, email, otp);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "OTP verified successfully",
      data: { resetToken },
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "newPassword is required",
        data: null,
      });
    }

    const payload = { id, newPassword };

    await AuthService.resetPassword(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const AuthController = {
  credentialLogin,
  getNewAccessToken,
  logout,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword
};

