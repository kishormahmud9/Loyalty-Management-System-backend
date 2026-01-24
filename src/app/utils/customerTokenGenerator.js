import { envVars } from "../config/env.js";
import { generateToken } from "./jwt.js";

/**
 * CREATE CUSTOMER TOKENS
 * 
 * Specialized for customers to ensure isolation from other roles.
 */
export const createCustomerTokens = (customer) => {
    const jwtPayload = {
        id: customer.id,
        email: customer.email,
        role: "CUSTOMER",
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
