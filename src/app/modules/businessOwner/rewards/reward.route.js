import express from "express";
import RewardController from "./reward.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";


const router = express.Router();

router.post("/create", checkAuthMiddleware(Role.BUSINESS_OWNER), RewardController.create);
router.get("/", checkAuthMiddleware(Role.BUSINESS_OWNER), RewardController.getAll);
router.get("/:id", checkAuthMiddleware(Role.BUSINESS_OWNER), RewardController.getOne);

router.get("/business/:businessId", checkAuthMiddleware(Role.BUSINESS_OWNER), RewardController.getByBusiness);
router.get("/branch/:branchId", checkAuthMiddleware(Role.BUSINESS_OWNER), RewardController.getByBranch);

router.delete("/:id", checkAuthMiddleware(Role.BUSINESS_OWNER), RewardController.remove);

export const RewardRoutes=  router;
