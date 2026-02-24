import prisma from "../../../prisma/client.js";
import { calculateDistanceInMeters } from "../../../lib/geoDistance.js";
import admin from "../../../config/firebase.js";

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

  // 🔔 4️⃣ Get customer + notification preferences
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

  // 🧊 6️⃣ Cooldown Check
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

  // 🎯 7️⃣ FIND PERSONALIZED NOTIFICATION
  // Get top category from preferences
  let topCategory = null;
  if (customer.preferences && typeof customer.preferences === "object") {
    const prefs = customer.preferences;
    let maxCount = 0;
    let categoriesWithMax = [];

    for (const [cat, count] of Object.entries(prefs)) {
      if (count > maxCount) {
        maxCount = count;
        categoriesWithMax = [cat];
      } else if (count === maxCount && maxCount > 0) {
        categoriesWithMax.push(cat);
      }
    }

    // Only pick a top category if there is a clear winner (Case 1 & 2)
    // If there's a tie (Case 3) or no preferences, topCategory remains null
    if (categoriesWithMax.length === 1) {
      topCategory = categoriesWithMax[0];
    }
  }

  // Find most recent notification for this branch with matching category OR null category
  const targetNotification = await prisma.notification.findFirst({
    where: {
      branchId: nearestBranch.id,
      OR: [
        { targetCategory: topCategory },
        { targetCategory: null }
      ]
    },
    orderBy: [
      { targetCategory: "desc" }, // prioritized matching category (not null first)
      { createdAt: "desc" }
    ]
  });

  const message = targetNotification
    ? targetNotification.message
    : `You're near ${nearestBranch.name}. Check out our latest offers!`;

  // ✅ 8️⃣ CREATE NOTIFICATION IN DATABASE
  const notificationRecord = await prisma.notification.create({
    data: {
      businessId: nearestBranch.businessId,
      branchId: nearestBranch.id,
      message: message,
      sentByStaff: "SYSTEM",
      targetCategory: topCategory, // Mark which category triggered this
    },
  });

  await prisma.notificationCustomerState.create({
    data: {
      notificationId: notificationRecord.id,
      customerId: customerId,
    },
  });

  // 🔔 9️⃣ Send Push (if token exists)
  if (customer.fcmToken) {
    try {
      await admin.messaging().send({
        token: customer.fcmToken,
        notification: {
          title: `You're near ${nearestBranch.name}`,
          body: message,
        },
      });
    } catch (error) {
      console.log("Push send failed:", error.message);
    }
  } else {
    console.log("No FCM token found. Push skipped.");
  }

  // 📝 9️⃣ Update cooldown state
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
