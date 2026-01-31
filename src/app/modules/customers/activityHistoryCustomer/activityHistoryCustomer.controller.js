import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import { ActivityHistoryCustomerService } from "./activityHistoryCustomer.service.js";

const getMyActivityHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { branchId } = req.body;
        const result = await ActivityHistoryCustomerService.getActivityHistory(customerId, branchId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Activity history retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const ActivityHistoryCustomerController = {
    getMyActivityHistory
};
