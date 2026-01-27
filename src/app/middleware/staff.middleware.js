import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";

export const checkStaffAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, envVars.JWT_SECRET_TOKEN);

    if (decoded.role !== "STAFF" || decoded.type !== "STAFF") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔒 Resolve staff from token (SAFE)
    const staff = await prisma.staff.findUnique({
      where: { userId: decoded.id },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found",
      });
    }

    if (!staff.isActive) {
      return res.status(403).json({
        success: false,
        message: "Staff account is inactive",
      });
    }

    // Attach SAFE context
    req.staff = {
      id: staff.id,
      userId: staff.userId,
      businessId: staff.businessId,
      branchId: staff.branchId,
      role: staff.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const checkStaffTempAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, envVars.JWT_SECRET_TOKEN);

    if (decoded.role !== "STAFF" || decoded.type !== "STAFF_TEMP") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // attach ONLY user id
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
