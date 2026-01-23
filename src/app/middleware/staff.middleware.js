import prisma from "../prisma/client.js";

/**
 * Temporary staff resolver
 * Reads staffId from query or body
 * Attaches staff to req.staff
 */
export const resolveStaff = async (req, res, next) => {
  try {
    const staffId = req.query.staffId || req.body.staffId;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "staffId is required",
      });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    if (!staff.isActive) {
      return res.status(403).json({
        success: false,
        message: "Staff account is inactive",
      });
    }

    req.staff = staff;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resolve staff",
    });
  }
};
