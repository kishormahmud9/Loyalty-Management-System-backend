import prisma from "../../../prisma/client.js";
import { calculateDistanceInMeters } from "../../../lib/geoDistance.js";

export const handleCustomerLocationService = async (
  customerId,
  latitude,
  longitude
) => {
  // 1️⃣ Check if geo feature enabled
  const setting = await prisma.platformGeoSetting.findFirst();

  if (!setting || !setting.isEnabled) {
    return { message: "Geo feature disabled" };
  }

  // 2️⃣ Get active branches with coordinates
  const branches = await prisma.branch.findMany({
    where: {
      isActive: true,
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  if (!branches.length) {
    return { message: "No active branches available" };
  }

  // 3️⃣ Find nearest branch within radius
  let nearestBranch = null;
  let minDistance = Infinity;

  for (const branch of branches) {
    const distance = calculateDistanceInMeters(
      latitude,
      longitude,
      branch.latitude,
      branch.longitude
    );

    if (distance <= setting.radiusMeters && distance < minDistance) {
      nearestBranch = branch;
      minDistance = distance;
    }
  }

  if (!nearestBranch) {
    return { message: "No nearby branch within radius" };
  }

  // 🔔 4️⃣ Get customer + notification preferences FIRST
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      notifications: true,
    },
  });

  if (!customer) {
    return { message: "Customer not found" };
  }

  // 🛑 5️⃣ Respect customer preferences BEFORE cooldown
  if (
    !customer.notifications ||
    !customer.notifications.allowLocation ||
    !customer.notifications.pushNotification
  ) {
    return {
      message: "Notification blocked by customer preferences",
    };
  }

  // 🧊 6️⃣ Cooldown Check (after preference passes)
  const geoState = await prisma.geoNotificationState.findUnique({
    where: {
      customerId_branchId: {
        customerId,
        branchId: nearestBranch.id,
      },
    },
  });

  const now = new Date();

  if (geoState) {
    const diffInHours =
      (now.getTime() - geoState.lastSentAt.getTime()) /
      (1000 * 60 * 60);

    if (diffInHours < setting.cooldownHours) {
      return {
        message: "Cooldown active",
        nextAvailableInHours:
          setting.cooldownHours - diffInHours,
      };
    }
  }

  // 🔔 7️⃣ Send Push (if token exists)
  if (customer.fcmToken) {
    try {
      await admin.messaging().send({
        token: customer.fcmToken,
        notification: {
          title: `You're near ${nearestBranch.name}`,
          body: "Check out our latest offers!",
        },
      });
    } catch (error) {
      console.log("Push send failed:", error.message);
    }
  } else {
    console.log("No FCM token found. Push skipped.");
  }

  // 📝 8️⃣ Update cooldown state ONLY after successful trigger
  await prisma.geoNotificationState.upsert({
    where: {
      customerId_branchId: {
        customerId,
        branchId: nearestBranch.id,
      },
    },
    update: {
      lastSentAt: now,
    },
    create: {
      customerId,
      branchId: nearestBranch.id,
      lastSentAt: now,
    },
  });

  return {
    message: "Notification triggered",
    branchId: nearestBranch.id,
    distance: minDistance,
  };
};

export const updateFcmTokenService = async (customerId, fcmToken) => {
    if (!fcmToken) {
        throw new Error("FCM token is required");
    }

    const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: {
            fcmToken,
        },
    });

    return updatedCustomer;
};
