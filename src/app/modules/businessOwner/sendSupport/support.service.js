import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { auditLog } from "../../../utils/auditLogger.js";

const prisma = new PrismaClient();

class SupportService {
  static generateSupportId() {
    return "TCK-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  /* =========================
     CREATE SUPPORT TICKET
  ========================= */
  static async createSupport(data) {
    const allowedPriority = ["NORMAL", "HIGH", "MEDIUM"];

    if (!allowedPriority.includes(data.priority)) {
      throw new Error("Invalid priority value");
    }

    if (!data.userId || !data.businessId) {
      throw new Error("UserId and BusinessId are required");
    }

    const createdSupport = await prisma.support.create({
      data: {
        ticketId: this.generateSupportId(),
        userId: data.userId,
        businessId: data.businessId,
        branchId: data.branchId || null,
        branchName: data.branchName || null,
        date: new Date(data.date),
        issue: data.issue,
        priority: data.priority,
      },
    });

    /* 🔐 AUTO AUDIT LOG (NON-BLOCKING) */
    auditLog({
      userId: data.userId,
      businessId: data.businessId,
      action: "Created support ticket",
      actionType: "CREATE",
      metadata: {
        supportId: createdSupport.id,
        ticketId: createdSupport.ticketId,
        priority: createdSupport.priority,
        issue: createdSupport.issue,
        branchName: createdSupport.branchName,
      },
    });

    return createdSupport;
  }

  /* =========================
     GET ALL SUPPORT
  ========================= */
  static async getAllSupport() {
    return prisma.support.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /* =========================
     GET SUPPORT BY ID
  ========================= */
  static async getSupportById(id) {
    return prisma.support.findUnique({
      where: { id },
    });
  }
}

export default SupportService;
