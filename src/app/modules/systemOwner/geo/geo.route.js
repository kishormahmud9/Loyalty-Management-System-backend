import { Router } from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { getGeoSetting, updateGeoSetting, getAllBranchesWithLocation, updateBranchLocation } from "./geo.controller.js";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.SYSTEM_OWNER),
    getGeoSetting
);

router.patch(
    "/",
    checkAuthMiddleware(Role.SYSTEM_OWNER),
    updateGeoSetting
);

router.get(
    "/branches",
    checkAuthMiddleware(Role.SYSTEM_OWNER), getAllBranchesWithLocation
);

router.patch(
    "/branches/:branchId",
    checkAuthMiddleware(Role.SYSTEM_OWNER),
    updateBranchLocation
);

export const GeoRoutes = router;
