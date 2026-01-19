import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

class SupportService {
  static generateSupportId() {
    return "TCK-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  static async createSupport(data) {
    const allowedPriority = ["NORMAL", "HIGH", "MEDIUM"];

    if (!allowedPriority.includes(data.priority)) {
      throw new Error("Invalid priority value");
    }

    if (!data.userId || !data.businessId || !data.branchId) {
      throw new Error("UserId, BusinessId and BranchId are required");
    }

    return prisma.support.create({
      data: {
        ticketId: this.generateSupportId(),
        userId: data.userId,
        businessId: data.businessId,
        branchId: data.branchId,
        date: new Date(data.date),
        issue: data.issue,
        priority: data.priority,
      },
    });
  }

  static async getAllSupport() {
    return prisma.support.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getSupportById(id) {
    return prisma.support.findUnique({
      where: { id: Number(id) },
    });
  }
}

export default SupportService;
