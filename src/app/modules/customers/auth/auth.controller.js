
import { AuthService, forgotPasswordService } from "./auth.service.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { OtpService } from "../otp/otp.service.js";

import { envVars } from "../../../config/env.js";
import { createCustomerTokens } from "../../../utils/customerTokenGenerator.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { setCustomerTokenHeader, clearCustomerTokenHeader } from "../../../utils/setCustomerTokenHeader.js";

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

    // Check if customer is verified
    if (!customer.isVerified) {
      throw new AppError(StatusCodes.FORBIDDEN, "verify your email frist");
    }

    // Generate access & refresh tokens
    // Using specialized customer token generator
    const tokens = await createCustomerTokens(customer);

    // Hash the refresh token before storing it in the database
    const refreshHash = await bcrypt.hash(tokens.refreshToken, Number(envVars.BCRYPT_SALT_ROUND || 10));

    // 🧹 CLEANUP: Delete any existing sessions for this customer to avoid duplicate data
    await prisma.customerSession.deleteMany({
      where: { customerId: customer.id }
    });

    // Store the session in the database
    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        refreshHash: refreshHash,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days (matching JWT_REFRESH_EXPIRES_IN)
      },
    });

    // Set tokens in headers for customer
    setCustomerTokenHeader(res, tokens);

    // Remove sensitive fields
    const { passwordHash, ...saveCustomer } = customer;

    // Send response
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

// ✅ Refresh Token with Rotation logic
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

    // Find the customer
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

    // Find the session in the database
    const sessions = await prisma.customerSession.findMany({
      where: {
        customerId: customer.id,
        expiresAt: { gt: new Date() },
      },
    });

    const session = await (async () => {
      for (const s of sessions) {
        if (await bcrypt.compare(refreshToken, s.refreshHash)) {
          return s;
        }
      }
      return null;
    })();

    if (!session) {
      // Potentially a stolen token if valid JWT but not in DB
      // Security measure: optionally delete all sessions for this user here
      throw new AppError(StatusCodes.FORBIDDEN, "Refresh token revoked or session expired");
    }

    // 🔁 ROTATION: Delete the old session and create a new one
    await prisma.customerSession.delete({ where: { id: session.id } });

    const newTokens = await createCustomerTokens(customer);
    const newRefreshHash = await bcrypt.hash(newTokens.refreshToken, Number(envVars.BCRYPT_SALT_ROUND || 10));

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        refreshHash: newRefreshHash,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update tokens in headers
    setCustomerTokenHeader(res, newTokens);

    sendResponse(res, {
      success: true,
      message: "New access token retrieved successfully",
      statusCode: StatusCodes.OK,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // � Comprehensive Token Search
    let token =
      req.headers["x-refresh-token"] ||
      req.body.refreshToken ||
      req.headers.authorization ||
      req.headers["accesstoken"] ||
      req.headers["refreshtoken"] ||
      req.cookies?.refreshToken ||
      req.cookies?.accessToken;

    let customerId = null;
    let foundSource = "none";

    if (token) {
      const cleanToken = token.replace(/^Bearer\s*/i, "");
      try {
        const decoded = jwt.decode(cleanToken);
        if (decoded && decoded.id) {
          customerId = decoded.id;
          foundSource = "token";
        }
      } catch (err) {
        console.error("❌ Logout JWT Decode Error:", err.message);
      }
    }

    let deletedSessionsCount = 0;
    if (customerId) {
      // 💣 NUCLEAR LOGOUT: Delete ALL sessions for this ID
      const result = await prisma.customerSession.deleteMany({
        where: { customerId: customerId },
      });
      deletedSessionsCount = result.count;
      console.log(`✅ LOGOUT: Wiped ${deletedSessionsCount} session(s) for customer ${customerId}`);
    }

    // Clear tokens/cookies
    clearCustomerTokenHeader(res);
    res.clearCookie("accessToken", { httpOnly: true, secure: envVars.NODE_ENV === "production", sameSite: "none" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: envVars.NODE_ENV === "production", sameSite: "none" });

    sendResponse(res, {
      success: true,
      message: customerId
        ? `Logged out successfully.`
        : "Logged out successfully",
      statusCode: StatusCodes.OK,
      data: {
        identifiedCustomerId: customerId,
        sessionsDeleted: deletedSessionsCount,
        source: foundSource
      },
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

