import prisma from "../../../prisma/client.js";
import { getIO } from "../../../socket.js";

export const sendNotification = async ({ staff, body }) => {
  const { message } = body;

  if (!message || message.trim().length < 3) {
    throw new Error("Message is required");
  }

  // 1️⃣ Save to DB (SOURCE OF TRUTH)
  const { notification, recipientCount } = await prisma.$transaction(async (tx) => {
    const newNotification = await tx.notification.create({
      data: {
        businessId: staff.businessId,
        branchId: staff.branchId,
        message: message.trim(),
        sentByStaff: staff.id,
      },
    });

    // 2️⃣ Link to all customers in the SAME BRANCH
    const branchCustomers = await tx.customerBranchData.findMany({
      where: {
        branchId: staff.branchId,
      },
      select: {
        customerId: true,
      },
    });

    if (branchCustomers.length > 0) {
      await tx.notificationCustomerState.createMany({
        data: branchCustomers.map((c) => ({
          notificationId: newNotification.id,
          customerId: c.customerId,
        })),
        skipDuplicates: true,
      });
    }

    return { notification: newNotification, recipientCount: branchCustomers.length };
  });

  // 3️⃣ Emit socket event (REAL-TIME)
  try {
    const io = getIO();

    // Emit to business room (for business owner dashboard if any)
    io.to(`business:${staff.businessId}`).emit("notification:new", {
      id: notification.id,
      message: notification.message,
      createdAt: notification.createdAt,
    });

    // Also emit to individual customer rooms if they are connected
    // In a large scale app, we might just emit to a branch room
    // For now, business room is used by customers too based on socket.js join:business
    console.log(`📡 Notification emitted to business:${staff.businessId}`);
  } catch (error) {
    // socket failure must NOT break API
    console.warn("Socket emit failed:", error.message);
  }

  // 4️⃣ Return response
  return {
    id: notification.id,
    message: notification.message,
    createdAt: notification.createdAt,
    recipientCount
  };
};

export const deleteNotification = async ({ staff, params }) => {
  const { id } = params;

  // 1️⃣ Verify ownership/branch
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.branchId !== staff.branchId) {
    throw new Error("Unauthorized: You can only delete notifications from your branch");
  }

  // 2️⃣ Delete from DB (Cascading delete handles NotificationCustomerState)
  await prisma.notification.delete({
    where: { id },
  });

  // 3️⃣ Emit socket event
  try {
    const io = getIO();
    io.to(`business:${staff.businessId}`).emit("notification:deleted", { id });
  } catch (error) {
    console.warn("Socket emit failed:", error.message);
  }

  return { id };
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
