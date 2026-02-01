import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import { TransactionHistoryCustomerService } from "./transactionHistoryCustomer.service.js";

const getEarnedHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        console.log(`📥 [API_REQUEST] Customer ${customerId} requesting Earned History`);
        const result = await TransactionHistoryCustomerService.getEarnedPointsHistory(customerId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Earned points history retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const TransactionHistoryCustomerController = {
    getEarnedHistory
};
