import { AuthService, forgotPasswordService } from "./auth.service.js";
import { OtpService } from "../otp/otp.service.js";
import jwt from "jsonwebtoken";
import { envVars } from "../../config/env.js";
import { createUserTokens } from "../../utils/userTokenGenerator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { setAuthCookie } from "../../utils/setCookie.js";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import prisma from "../../prisma/client.js";
import { AppError } from "../../errorHelper/appError.js";

const credentialLogin = async (req, res, next) => {
  try {
    passport.authenticate("local", async (err, user, info) => {
      try {
        if (err) {
          return next(new AppError(StatusCodes.UNAUTHORIZED, err));
        }

        if (!user) {
          return next(
            new AppError(
              StatusCodes.FORBIDDEN,
              info?.message || "Authentication failed",
            ),
          );
        }

        // Enforce isVerified check
        if (!user.isVerified) {
          return next(new AppError(StatusCodes.FORBIDDEN, "verify your email frist"));
        }

        // Generate access & refresh tokens
        const context = await AuthService.getUserContext(
          prisma,
          user.id,
          user.role,
        );
        const userToken = await createUserTokens(user, context);

        // Remove sensitive fields before sending user
        const { passwordHash, ...saveUser } = user;

        // Set cookies
        setAuthCookie(res, userToken);

        // Send response
        sendResponse(res, {
          success: true,
          message: "User logged in successfully",
          statusCode: StatusCodes.OK,
          data: {
            accessToken: userToken.accessToken,
            refreshToken: userToken.refreshToken,
            user: saveUser,
            businessId: context.businessId,
            branchId: context.branchId,
          },
        });
      } catch (innerError) {
        next(innerError);
      }
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

// ✅ Refresh Token

const getNewAccessToken = async (req, res, next) => {
  try {
    // const prisma = req.app.get("prisma"); // REMOVED
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "No refresh token received from cookies",
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, envVars.JWT_REFRESH_TOKEN);
    } catch (err) {
      throw new AppError(StatusCodes.FORBIDDEN, "Invalid refresh token");
    }

    const user = await AuthService.findById(prisma, decoded.id);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (!user.isVerified) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "User is not verified. Please verify your email.",
      );
    }

    const context = await AuthService.getUserContext(
      prisma,
      user.id,
      user.role,
    );

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: context.businessId || null,
        branchId: context.branchId || null,
        staffId: context.staffId || null,
      },
      envVars.JWT_SECRET_TOKEN,
      { expiresIn: envVars.JWT_EXPIRES_IN },
    );

    setAuthCookie(res, {
      accessToken: newAccessToken,
      refreshToken,
    });

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
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

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
    // const prisma = req.app.get("prisma"); // REMOVED
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
    // const prisma = req.app.get("prisma"); // REMOVED
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Email and OTP are required",
        data: null,
      });
    }

    const resetToken = await OtpService.verifyForgotPasswordOtp(
      prisma,
      email,
      otp,
    );

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

const changePassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new AppError(StatusCodes.BAD_REQUEST, "oldPassword and newPassword are required");
    }

    await AuthService.changePassword(prisma, id, { oldPassword, newPassword });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    let redirectTo = req.query.state ? String(req.query.state) : "";

    // Prevent open redirect issues
    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user; // comes from Passport Google Strategy

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    // Enforce isVerified check
    if (!user.isVerified) {
      return res.redirect(`${envVars.FRONT_END_URL}/login?error=verify your email frist&isError=true`);
    }

    // Generate tokens
    const context = await AuthService.getUserContext(
      prisma,
      user.id,
      user.role,
    );
    const tokenInfo = await createUserTokens(user, context);

    // Set auth cookies
    setAuthCookie(res, tokenInfo);

    // Redirect to frontend
    res.redirect(`${envVars.FRONT_END_URL}/${redirectTo}`);
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
  resetPassword,
  changePassword,
  googleCallback,
};
