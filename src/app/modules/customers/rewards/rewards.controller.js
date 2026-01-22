
import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { CustomerRewardService } from "./rewards.service.js";
import { AppError } from "../../../errorHelper/appError.js";

const getBranchRewards = async (req, res, next) => {
    try {
        const { branchId } = req.body;
        const customerId = req.user.id;

        if (!branchId) {
            throw new AppError(StatusCodes.BAD_REQUEST, "branchId is required in request body");
        }

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

export const CustomerRewardController = {
    getBranchRewards
};
