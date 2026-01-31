import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import { EarnRewardCustomerService } from "./earnRewardCustomer.service.js";

const getMyEarnRewards = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { branchId } = req.query;

        const result = await EarnRewardCustomerService.getEarnRewardsByBranch(customerId, branchId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Earn rewards retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const EarnRewardCustomerController = {
    getMyEarnRewards
};
