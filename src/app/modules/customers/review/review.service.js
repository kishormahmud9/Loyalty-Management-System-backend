
export const ReviewService = {
    createReview(prisma, data) {
        return prisma.review.create({
            data,
        });
    },

    getReviewsByBranch(prisma, branchId, isAdmin = false) {
        return prisma.review.findMany({
            where: {
                branchId,
                ...(isAdmin ? {} : { hideStatus: false }),
            },
            include: {
                customer: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    getReviewsByBusiness(prisma, businessId, isAdmin = false) {
        return prisma.review.findMany({
            where: {
                businessId,
                ...(isAdmin ? {} : { hideStatus: false }),
            },
            include: {
                customer: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                branch: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    toggleHideStatus(prisma, reviewId, hideStatus) {
        return prisma.review.update({
            where: { id: reviewId },
            data: { hideStatus },
        });
    },
};
