import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../../../config/env.js";
import { OtpService } from "../../otp/otp.service.js";
import { AppError } from "../../../errorHelper/appError.js";
import jwt from "jsonwebtoken";

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

    if (!user.staffProfile) {
      return { error: "Staff profile not found" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    // 🔐 JWT with branchId (SOURCE OF TRUTH)
    const token = jwt.sign(
      {
        id: user.id, // Fixed: use 'id' to match middleware expectation
        role: "STAFF",
        type: "STAFF_TEMP",
      },
      envVars.JWT_SECRET_TOKEN,
      { expiresIn: "15m" },
    );

    return {
      token,
      requirePinSetup: user.staffProfile.pinHash === null,
      branchId: user.staffProfile.branchId,
    };
  } catch (error) {
    console.error("Staff Login Service Error:", error.message);
    return { error: "Failed to login staff" };
  }
};

// Helper function to check if PIN is unique within the branch
const checkPinUniqueness = async (prisma, branchId, pin, excludeUserId) => {
  const branchStaffs = await prisma.staff.findMany({
    where: {
      branchId,
      user: {
        isPinSet: true,
        NOT: {
          id: excludeUserId,
        },
      },
    },
    include: {
      user: true,
    },
  });

  for (const staff of branchStaffs) {
    if (staff.user.pinHash) {
      const isMatch = await bcrypt.compare(pin, staff.user.pinHash);
      if (isMatch) {
        return false; // PIN is already in use
      }
    }
  }
  return true;
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
      include: {
        staffProfile: true, // Fetch staff profile to get branchId
      },
    });

    if (!user || user.role !== "STAFF") {
      return { error: "Unauthorized" };
    }

    if (user.isPinSet) {
      return { error: "PIN already set" };
    }

    if (!user.staffProfile) {
      return { error: "Staff profile not found" };
    }

    // Check for unique PIN in the branch
    const isUnique = await checkPinUniqueness(
      prisma,
      user.staffProfile.branchId,
      pin,
      userId,
    );

    if (!isUnique) {
      return { error: "This PIN is already in use by another staff member in this branch. Please choose a different PIN." };
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

        // 🔍 Fetch Business Permissions
        const permissions = await prisma.staffPermission.findUnique({
          where: { businessId: staff.businessId },
        });

        const token = jwt.sign(
          {
            id: staff.user.id,
            role: "STAFF",
            type: "STAFF",
            staffId: staff.id,
            businessId: staff.businessId,
            branchId: staff.branchId,
            name: staff.user.name,
            permissions: permissions || {}, // Include permissions for the frontend
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

export const forgotPinService = async (prisma, email) => {
  const staffUser = await prisma.user.findFirst({
    where: {
      email,
      role: "STAFF",
    },
  });

  if (!staffUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "Staff not found");
  }

  await prisma.user.update({
    where: { id: staffUser.id },
    data: { forgotPasswordStatus: false },
  });

  await OtpService.sendForgotPasswordOtp(prisma, email);
  return true;
};

export const verifyForgotPinOtpService = async (prisma, email, otp) => {
  await OtpService.verifyForgotPasswordOtp(prisma, email, otp);

  await prisma.user.update({
    where: { email },
    data: { forgotPasswordStatus: true },
  });

  return true;
};

export const resetPinService = async (prisma, email, newPin, confirmPin) => {
  if (newPin !== confirmPin) {
    throw new AppError(StatusCodes.BAD_REQUEST, "PINs do not match");
  }

  const staffUser = await prisma.user.findFirst({
    where: {
      email,
      role: "STAFF",
    },
    include: {
      staffProfile: true, // Fetch staff profile to get branchId
    },
  });

  if (!staffUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "Staff not found");
  }

  if (!staffUser.forgotPasswordStatus) {
    throw new AppError(StatusCodes.FORBIDDEN, "Please verify OTP first");
  }

  if (!staffUser.staffProfile) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Staff profile not found");
  }

  // Check for unique PIN in the branch
  const isUnique = await checkPinUniqueness(
    prisma,
    staffUser.staffProfile.branchId,
    newPin,
    staffUser.id,
  );

  if (!isUnique) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This PIN is already in use by another staff member in this branch. Please choose a different PIN.");
  }

  const hashedPin = await bcrypt.hash(
    newPin,
    Number(envVars.BCRYPT_SALT_ROUND || 10),
  );

  await prisma.user.update({
    where: { id: staffUser.id },
    data: {
      pinHash: hashedPin,
      isPinSet: true,
      forgotPasswordStatus: false,
    },
  });

  return true;
};
