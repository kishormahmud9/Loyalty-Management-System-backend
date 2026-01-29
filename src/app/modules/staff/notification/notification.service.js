import prisma from "../../../prisma/client.js";
import { getIO } from "../../../socket.js";

export const sendNotification = async ({ staff, body }) => {
  const { message } = body;

  if (!message || message.trim().length < 3) {
    throw new Error("Message is required");
  }

  // 1️⃣ Save to DB (SOURCE OF TRUTH)
  const notification = await prisma.notification.create({
    data: {
      businessId: staff.businessId,
      branchId: staff.branchId,
      message: message.trim(),
      sentByStaff: staff.id,
    },
  });

  // 2️⃣ Emit socket event (REAL-TIME)
  try {
    const io = getIO();

    io.to(`business:${staff.businessId}`).emit("notification:new", {
      id: notification.id,
      message: notification.message,
      createdAt: notification.createdAt,
    });
  } catch (error) {
    // socket failure must NOT break API
    console.warn("Socket emit failed:", error.message);
  }

  // 3️⃣ Return response
  return {
    id: notification.id,
    message: notification.message,
    createdAt: notification.createdAt,
  };
};

export const getNotificationHistory = async ({ staff }) => {
  return prisma.notification.findMany({
    where: {
      businessId: staff.businessId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      message: true,
      createdAt: true,
    },
  });
};
