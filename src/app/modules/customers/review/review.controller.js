
import { sendResponse } from "../../../utils/sendResponse.js";
import { ReviewService } from "./review.service.js";

export const ReviewController = {
    handleCreateReview: async (req, res, next) => {
        try {
            const customerId = req.user.id;
            let { reviewText, branchName, star, businessId, branchId } = req.body;

            // 0. Fallback to activeBranchId if branchId is missing
            if (!branchId) {
                const customer = await req.prisma.customer.findUnique({
                    where: { id: customerId },
                    select: { activeBranchId: true }
                });
                branchId = customer?.activeBranchId;
            }

            if (!branchId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "No branch selected and no active branch found.",
                    data: null,
                });
            }

            // 1. Fetch branch/business details if businessId or branchName is missing
            const branch = await req.prisma.branch.findUnique({
                where: { id: branchId },
                select: { businessId: true, name: true }
            });

            if (!branch) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Selected branch not found",
                    data: null,
                });
            }

            businessId = businessId || branch.businessId;
            branchName = branchName || branch.name;

            if (!reviewText || star === undefined) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Missing required fields: reviewText, star",
                    data: null,
                });
            }

            const reviewData = {
                customerId,
                businessId,
                branchId,
                reviewText,
                branchName: branchName || "",
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
            let { branchId } = req.params;

            // Optional: fallback if branchId is "active" or missing
            if (!branchId || branchId === "active") {
                const customer = await req.prisma.customer.findUnique({
                    where: { id: req.user.id },
                    select: { activeBranchId: true }
                });
                branchId = customer?.activeBranchId;
            }

            if (!branchId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "branchId is required or no active branch set",
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
