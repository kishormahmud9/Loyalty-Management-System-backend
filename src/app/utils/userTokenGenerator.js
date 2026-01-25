import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env.js";

import { generateToken, verifyToken } from "./jwt.js";
import { AppError } from "../errorHelper/appError.js";
import { AuthService } from "../modules/auth/auth.service.js";


//  CREATE USER TOKENS

export const createUserTokens = (user, context = {}) => {
  const jwtPayload = {
    id: user.id, // Standardized to 'id'
    email: user.email,
    role: user.role,
    businessId: context.businessId || null,
    branchId: context.branchId || null,
    staffId: context.staffId || null,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_TOKEN,
    envVars.JWT_REFRESH_EXPIRES_IN
  );

  return { accessToken, refreshToken };
};
//  CREATE NEW ACCESS TOKEN USING REFRESH TOKEN

export const createNewAccessTokenUsingRefreshToken = async (
  prisma,
  refreshToken
) => {
  const verifyRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_TOKEN
  );

  const isUser = await prisma.user.findUnique({
    where: { email: verifyRefreshToken.email },
  });

  if (!isUser) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User does not exist"
    );
  }

  const context = await AuthService.getUserContext(prisma, isUser.id, isUser.role);

  const jwtPayload = {
    id: isUser.id,
    email: isUser.email,
    role: isUser.role,
    businessId: context.businessId || null,
    branchId: context.branchId || null,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN
  );

  return accessToken;
};
