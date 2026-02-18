import prisma from "../../../prisma/client.js";

export const getCustomerNotificationsService = async (customerId) => {
  return await prisma.notificationCustomerState.findMany({
    where: {
      customerId,
      isDeleted: false,
    },
    include: {
      notification: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const deleteCustomerNotificationService = async (customerId, notificationId) => {
  return await prisma.notificationCustomerState.update({
    where: {
      notificationId_customerId: {
        notificationId,
        customerId,
      },
    },
    data: {
      isDeleted: true,
    },
  });
};

