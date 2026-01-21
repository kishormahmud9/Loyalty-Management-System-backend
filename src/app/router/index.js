import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import tenantRouter from "../modules/tenant/tenant.route.js";
import { BusinessOwnerSupport } from "../modules/businessOwner/sendSupport/support.route.js";
import { SubscriptionRoutes } from "../modules/businessOwner/buySubscription/subscription.route.js";
import { RewardRoutes } from "../modules/businessOwner/rewards/reward.route.js";
import { BranchRoute } from "../modules/businessOwner/branchs/branchs.route.js";
import { ManageStaffRoute } from "../modules/businessOwner/manageStaff/manageStaff.route.js";

import { CustomerRoutes } from "../modules/customers/customer/customer.route.js";
import { CustomerAuthRouter } from "../modules/customers/auth/auth.route.js";
import { CustomerOtpRouter } from "../modules/customers/otp/otp.route.js";


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
    path: "/business-owner/reward",
    route: RewardRoutes,
  },
  {
    path: "/business-owner/branchs",
    route: BranchRoute,
  },
  {
    path: "/business-owner/manage-staff",
    route: ManageStaffRoute,
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
  // system owner ends
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
