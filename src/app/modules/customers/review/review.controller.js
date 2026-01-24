
import { sendResponse } from "../../../utils/sendResponse.js";
import { ReviewService } from "./review.service.js";

export const ReviewController = {
    handleCreateReview: async (req, res, next) => {
        try {
            const customerId = req.user.id;
            const { reviewText, branchName, star, businessId, branchId } = req.body;

            if (!businessId || !branchId || !reviewText || star === undefined) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Missing required fields: businessId, branchId, reviewText, star",
                    data: null,
                });
            }

            const reviewData = {
                customerId,
                businessId,
                branchId,
                reviewText,
                branchName: branchName || "", // Optional or fallback
                star: parseInt(star),
                hideStatus: false,
            };

            if (reviewData.star > 5 || reviewData.star < 1) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Star rating must be between 1 and 5",
                    data: null,
                });
            }

            const result = await ReviewService.createReview(req.prisma, reviewData);

            sendResponse(res, {
                statusCode: 201,
                success: true,
                message: "Review created successfully",
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },

    handleGetBranchReviews: async (req, res, next) => {
        try {
            const { branchId } = req.params;

            if (!branchId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "branchId is required",
                    data: null,
                });
            }

            const reviews = await ReviewService.getReviewsByBranch(req.prisma, branchId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Branch reviews retrieved successfully",
                data: reviews,
            });
        } catch (err) {
            next(err);
        }
    },
};
