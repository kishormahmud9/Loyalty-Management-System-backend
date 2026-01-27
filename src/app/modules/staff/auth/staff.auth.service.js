import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envVars } from "../../../config/env.js";

export const staffLoginService = async (prisma, payload) => {
  try {
    const { email, password } = payload;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        staffProfile: true,
      },
    });

    if (!user || user.role !== "STAFF") {
      return { error: "Invalid credentials" };
    }

    if (user.status !== "ACTIVE") {
      return { error: "Account is not active" };
    }

    if (!user.passwordHash) {
      return { error: "Password not set" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: "STAFF",
        type: "STAFF_TEMP",
      },
      envVars.JWT_SECRET_TOKEN,
      { expiresIn: "15m" },
    );

    return {
      token,
      requirePinSetup: !user.isPinSet,
    };
  } catch (error) {
    console.error("Staff Login Service Error:", error.message);
    return { error: "Failed to login staff" };
  }
};

export const setStaffPinService = async (prisma, userId, payload) => {
  try {
    const { pin, confirmPin } = payload;

    if (!pin || !confirmPin) {
      return { error: "PIN and confirm PIN are required" };
    }

    if (!/^\d{6}$/.test(pin)) {
      return { error: "PIN must be exactly 6 digits" };
    }

    if (pin !== confirmPin) {
      return { error: "PINs do not match" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "STAFF") {
      return { error: "Unauthorized" };
    }

    if (user.isPinSet) {
      return { error: "PIN already set" };
    }

    const pinHash = await bcrypt.hash(pin, Number(envVars.BCRYPT_SALT_ROUND));

    await prisma.user.update({
      where: { id: userId },
      data: {
        pinHash,
        isPinSet: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Set PIN Service Error:", error.message);
    return { error: "Failed to set PIN" };
  }
};

export const staffPinLoginService = async (prisma, payload) => {
  try {
    const { branchId, pin } = payload;

    if (!branchId || !pin) {
      return { error: "Branch and PIN are required" };
    }

    if (!/^\d{6}$/.test(pin)) {
      return { error: "PIN must be exactly 6 digits" };
    }

    // 🔍 Get all active staff of this branch
    const staffs = await prisma.staff.findMany({
      where: {
        branchId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (!staffs.length) {
      return { error: "Invalid PIN" };
    }

    // 🔐 Compare PIN with each staff
    for (const staff of staffs) {
      if (!staff.user.isPinSet || !staff.user.pinHash) continue;

      const match = await bcrypt.compare(pin, staff.user.pinHash);

      if (match) {
        // ✅ FOUND THE STAFF
        const token = jwt.sign(
          {
            id: staff.user.id,
            role: "STAFF",
            type: "STAFF",
            staffId: staff.id,
            businessId: staff.businessId,
            branchId: staff.branchId,
          },
          envVars.JWT_SECRET_TOKEN,
          { expiresIn: envVars.JWT_EXPIRES_IN },
        );

        return { token };
      }
    }

    return { error: "Invalid PIN" };
  } catch (error) {
    console.error("Staff PIN Login Error:", error.message);
    return { error: "Failed to login with PIN" };
  }
};