import DevBuildError from "../../lib/DevBuildError.js";
import { AuthService } from "./auth.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envVars } from "../../config/env.js";
import { createUserTokens } from "../../utils/userTokenGenerator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { setAuthCookie } from "../../utils/setCookie.js";
import { StatusCodes } from "http-status-codes";

// ✅ Login User
const loginUser = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const { email, password } = req.body;
    console.log("📌 Login Request:", email);

    if (!password) throw new DevBuildError("Password required", 400);

    // ✅ Fetch user from DB
    const user = await AuthService.findByEmail(prisma, email);
    if (!user) throw new DevBuildError("User not found", 400);

    // ✅ Password Matching (use stored passwordHash)
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new DevBuildError("Invalid credentials", 400);
    }

    // ✅ Check if user is verified
    if (!user.isVerified) {
      throw new DevBuildError(
        "User is not verified. Please verify your email.",
        403
      );
    }

    // ✅ Generate Tokens
    const userToken = createUserTokens(user);
    setAuthCookie(res, userToken);
    sendResponse(res, {
      success: true,
      message: "User logged in Successful",
      statusCode: StatusCodes.OK,
      data: {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Refresh Token

const getNewAccessToken = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new DevBuildError(
        "No refresh token received from cookies",
        StatusCodes.BAD_REQUEST
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        envVars.JWT_REFRESH_TOKEN
      );
    } catch (err) {
      throw new DevBuildError("Invalid refresh token", StatusCodes.FORBIDDEN);
    }

    const user = await AuthService.findById(prisma, decoded.id);

    if (!user) {
      throw new DevBuildError("User not found", StatusCodes.NOT_FOUND);
    }

    if (!user.isVerified) {
      throw new DevBuildError(
        "User is not verified. Please verify your email.",
        StatusCodes.FORBIDDEN
      );
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      envVars.JWT_SECRET_TOKEN,
      { expiresIn: envVars.JWT_EXPIRES_IN }
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
export const AuthController = { loginUser, getNewAccessToken ,logout};
