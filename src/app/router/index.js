import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";

import { DashboardRoutes } from "../modules/systemOwner/dashboard/dashboard.routes.js";
import tenantRouter from "../modules/systemOwner/tenant/tenant.route.js";
import { SupportRoutes } from "../modules/systemOwner/support/support.routes.js";
import { AuditLogRoutes } from "../modules/systemOwner/auditLog/auditLog.route.js";
import { PlanRoutes } from "../modules/systemOwner/plan/plan.route.js";

import { BusinessOwnerSupport } from "../modules/businessOwner/sendSupport/support.route.js";
import { SubscriptionRoutes } from "../modules/businessOwner/buySubscription/subscription.route.js";
import { RedeemRewardRoutes } from "../modules/businessOwner/redeemReward/redeemReward.route.js";
import { EarnRewardRoutes } from "../modules/businessOwner/earnReward/earnReward.route.js";
import { BranchRoute } from "../modules/businessOwner/branchs/branchs.route.js";
import { ManageStaffRoute } from "../modules/businessOwner/manageStaff/manageStaff.route.js";
import { AllCustomersRoutes } from "../modules/businessOwner/all-customers/all-customers.route.js";
import { BusinessRewardHistoryRoutes } from "../modules/businessOwner/rewardHistory/rewardHistory.route.js";
import { StaffPermissionRoutes } from "../modules/businessOwner/staffPermission/staffPermission.route.js";
import { BusinessReviewRoutes } from "../modules/businessOwner/review/review.route.js";

import { CustomerRoutes } from "../modules/customers/customer/customer.route.js";
import { CustomerAuthRouter } from "../modules/customers/auth/auth.route.js";
import { CustomerOtpRouter } from "../modules/customers/otp/otp.route.js";
import { ClaimRewardCustomer } from "../modules/customers/claimReward/rewards.route.js";
import { CustomerRewardHistoryRoutes } from "../modules/customers/rewardHistory/rewardHistory.route.js";
import { CustomerReviewRoutes } from "../modules/customers/review/review.route.js";
import { ActivePlanRoutes } from "../modules/systemOwner/plan/activePlan.route.js";

import staffRoutes from "../modules/staff/customer/customer.route.js";
import transactionRoutes from "../modules/staff/transaction/transaction.route.js";
import addRedeemRoutes from "../modules/staff/addRedeem/addRedeem.route.js";
import staffRewardRoutes from "../modules/staff/reward/reward.route.js";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },

  {
    path: "/auth",
    route: AuthRouter,
  },

  {
    path: "/customer",
    route: CustomerRoutes,
  },

  {
    path: "/customer/auth",
    route: CustomerAuthRouter,
  },

  {
    path: "/customer/otp",
    route: CustomerOtpRouter,
  },
  {
    path: "/customer/claim-reward",
    route: ClaimRewardCustomer,
  },
  {
    path: "/customer/reward-history",
    route: CustomerRewardHistoryRoutes,
  },
  {
    path: "/customer/reviews-creation",
    route: CustomerReviewRoutes,
  },

  {
    path: "/otp",
    route: OtpRouter,
  },

  // business owner starts
  {
    path: "/business-owner/support",
    route: BusinessOwnerSupport,
  },
  {
    path: "/business-owner/buy-subscription",
    route: SubscriptionRoutes,
  },
  {
    path: "/business-owner/redeem-reward",
    route: RedeemRewardRoutes,
  },
  {
    path: "/business-owner/earn-reward",
    route: EarnRewardRoutes,
  },
  {
    path: "/business-owner/branchs",
    route: BranchRoute,
  },
  {
    path: "/business-owner/manage-staff",
    route: ManageStaffRoute,
  },
  {
    path: "/business-owner/all-customers",
    route: AllCustomersRoutes,
  },
  {
    path: "/business-owner/add-redeem",
    route: BusinessRewardHistoryRoutes,
  },
  {
    path: "/business-owner/staff-permission",
    route: StaffPermissionRoutes,
  },
  {
    path: "/business-owner/reviews",
    route: BusinessReviewRoutes,
  },
  // business owner ends

  // system owner starts
  {
    path: "/system-owner/dashboard",
    route: DashboardRoutes,
  },

  {
    path: "/system-owner/tenants",
    route: tenantRouter,
  },

  {
    path: "/system-owner/support",
    route: SupportRoutes,
  },

  {
    path: "/system-owner/audit-logs",
    route: AuditLogRoutes,
  },

  {
    path: "/system-owner/plans",
    route: PlanRoutes,
  },

  {
    path: "/business/active-plan",
    route: ActivePlanRoutes,
  },
  // system owner ends

  // staff routes
  {
    path: "/staff/customers",
    route: staffRoutes,
  },

  {
    path: "/staff/transactions",
    route: transactionRoutes,
  },

  {
    path: "/staff/add-redeem",
    route: addRedeemRoutes,
  },

  {
    path: "/staff/rewards",
    route: staffRewardRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
