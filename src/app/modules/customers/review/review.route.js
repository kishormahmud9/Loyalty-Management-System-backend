
import { Router } from "express";
import { ReviewController } from "./review.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = Router();

router.post(
    "/create",
    customerAuthMiddleware,
    ReviewController.handleCreateReview
);

router.get("/:branchId", ReviewController.handleGetBranchReviews);

export const CustomerReviewRoutes = router;
