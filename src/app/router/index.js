import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { ProfileRoutes } from "../modules/profile/profile.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";




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
    path: "/profile",
    route: ProfileRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});