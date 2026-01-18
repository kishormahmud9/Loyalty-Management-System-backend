import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import tenantRouter from "../modules/tenant/tenant.route.js";

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
    path: "/otp",
    route: OtpRouter,
  },

  {
    path: "/system-owner/dashboard",
    route: DashboardRoutes,
  },

  {
    path: "/system-owner/tenants",
    route: tenantRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
