import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { envVars } from "../config/env.js";

dotenv.config();

// ✅ Authentication Middleware
export const authenticateUser = (req, res, next) => {
    let token = req.header("Authorization");

    // Fallback to cookie if Authorization header is missing
    if (!token && req.cookies?.accessToken) {
        token = `Bearer ${req.cookies.accessToken}`;
    }

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Safe token extraction (handles "Bearer <token>", "Bearer<token>", or just "<token>")
        const jwtToken = token.replace(/^Bearer\s*/i, "");

        const decoded = jwt.verify(jwtToken, envVars.JWT_SECRET_TOKEN);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("🔑 JWT Verification Error:", error.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// ✅ Admin Middleware
export const authenticateAdmin = (req, res, next) => {
    authenticateUser(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    });
};
