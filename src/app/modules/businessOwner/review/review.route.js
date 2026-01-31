
import { Router } from "express";
import { BusinessReviewController } from "./review.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
    "/all",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessReviewController.handleGetBusinessReviews
);

router.patch(
    "/toggle-hide/:reviewId",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessReviewController.handleToggleHideStatus
);

export const BusinessReviewRoutes = router;
