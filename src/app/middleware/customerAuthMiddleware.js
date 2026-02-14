import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";

export const customerAuthMiddleware = async (req, res, next) => {
    console.log("🔥 Customer Auth middleware hit:", req.originalUrl);

    try {
        let token = req.headers.authorization || req.cookies?.accessToken || req.headers.accesstoken || req.query.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const jwtToken = token.replace(/^Bearer\s*/i, "");
        const decoded = jwt.verify(jwtToken, envVars.JWT_SECRET_TOKEN);

        const customer = await prisma.customer.findUnique({
            where: { id: decoded.id },
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Attach customer to request
        req.user = customer;
        next();
    } catch (error) {
        console.error("customerAuthMiddleware error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
