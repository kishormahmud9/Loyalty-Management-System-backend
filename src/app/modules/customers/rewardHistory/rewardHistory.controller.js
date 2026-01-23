import { CustomerRewardHistoryService } from "./rewardHistory.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const getMyHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const result = await CustomerRewardHistoryService.getMyHistory(customerId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Your reward history retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyBranchHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { branchId } = req.params;
        const result = await CustomerRewardHistoryService.getMyHistoryByBranch(customerId, branchId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Branch reward history retrieved",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export const CustomerRewardHistoryController = {
    getMyHistory,
    getMyBranchHistory
};
