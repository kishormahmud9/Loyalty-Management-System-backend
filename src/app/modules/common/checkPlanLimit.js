import prisma from "../../prisma/client.js";
import { checkSubscriptionStatus } from "./checkSubscriptionStatus.js";

export const checkPlanLimit = async ({ businessId, type }) => {
  const status = await checkSubscriptionStatus(businessId);

  if (status.error) {
    return { error: status.error };
  }

  if (status.expired) {
    return { error: status.message };
  }

  const subscription = status.subscription;

  switch (type) {
    case "STAFF": {
      const count = await prisma.staff.count({ where: { businessId } });
      if (count >= subscription.maxStaff) {
        return { error: "Staff limit reached for your plan" };
      }
      break;
    }

    case "BRANCH": {
      const count = await prisma.branch.count({ where: { businessId } });
      if (count >= subscription.maxBranches) {
        return { error: "Branch limit reached for your plan" };
      }
      break;
    }

    case "CARD": {
      const count = await prisma.redeemReward.count({ where: { businessId } });
      if (count >= subscription.maxCards) {
        return { error: "Card limit reached for your plan" };
      }
      break;
    }

    default:
      return { error: "Invalid limit type" };
  }

  return { allowed: true };
};
