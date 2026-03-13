import { envVars } from "../config/env.js";

export const setAuthCookie = (res, tokenInfo) => {
  const isProduction = envVars.NODE_ENV === "production";
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    // When secure is false (local), sameSite should be 'lax' or 'strict'.
    // 'none' requires 'secure: true'.
    sameSite: isProduction ? "none" : "lax",
  };

  if (tokenInfo?.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, cookieOptions);
  }

  if (tokenInfo?.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, cookieOptions);
  }
};

