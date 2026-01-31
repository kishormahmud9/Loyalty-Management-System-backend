
import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { CustomerRewardService } from "./rewards.service.js";
import { AppError } from "../../../errorHelper/appError.js";

const getBranchRewards = async (req, res, next) => {
    try {
        const { branchId } = req.query; // Changed from req.body to req.query
        const customerId = req.user.id;

        const result = await CustomerRewardService.getRewardsByBranch(
            prisma,
            customerId,
            branchId
        );

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Branch rewards retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getRedeemRewardsByBranch = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const customerId = req.user.id;

        if (!branchId) {
            throw new AppError(StatusCodes.BAD_REQUEST, "branchId is required in request params");
        }

        const result = await CustomerRewardService.getRedeemRewardsByBranch(
            prisma,
            branchId
        );

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Redeem Rewards retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const claimReward = async (req, res, next) => {
    try {
        const { rewardId } = req.params;
        const customerId = req.user.id; // From customerAuthMiddleware

        if (!rewardId) {
            throw new AppError(StatusCodes.BAD_REQUEST, "rewardId is required in params");
        }

        const result = await CustomerRewardService.claimReward(
            prisma,
            customerId,
            rewardId
        );

        sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: "Reward claimed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getRewardsWithClaimStatus = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const customerId = req.user.id;

        const result = await CustomerRewardService.getRewardsWithClaimStatus(
            prisma,
            customerId,
            branchId
        );

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Rewards with claim status retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const ClaimRewardControllerCustomer = {
    getBranchRewards,
    getRedeemRewardsByBranch,
    claimReward,
    getRewardsWithClaimStatus
};
