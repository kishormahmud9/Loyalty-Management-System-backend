
import { sendResponse } from "../../../utils/sendResponse.js";
import { ReviewService } from "../../customers/review/review.service.js";

export const BusinessReviewController = {
    handleGetBusinessReviews: async (req, res, next) => {
        try {
            const { businessId } = req.user;

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Business ID is missing from your profile",
                    data: null,
                });
            }

            const reviews = await ReviewService.getReviewsByBusiness(req.prisma, businessId, true);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Business reviews retrieved successfully",
                data: reviews,
            });
        } catch (err) {
            next(err);
        }
    },

    handleToggleHideStatus: async (req, res, next) => {
        try {
            const { reviewId } = req.params;
            const { hideStatus } = req.body;
            const ownerId = req.user.id;

            if (hideStatus === undefined) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "hideStatus is required",
                    data: null,
                });
            }

            // Find review to check business ownership
            const review = await req.prisma.review.findUnique({
                where: { id: reviewId },
                include: {
                    business: {
                        select: { ownerId: true },
                    },
                },
            });

            if (!review) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Review not found",
                    data: null,
                });
            }

            if (review.business.ownerId !== ownerId) {
                return sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: "Forbidden: You do not own the business associated with this review",
                    data: null,
                });
            }

            const result = await ReviewService.toggleHideStatus(req.prisma, reviewId, hideStatus);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: `Review ${hideStatus ? "hidden" : "unhidden"} successfully`,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },
};
