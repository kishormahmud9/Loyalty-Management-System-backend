import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import { TransactionHistoryCustomerService } from "./transactionHistoryCustomer.service.js";

const getEarnedHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { branchId } = req.query;

        console.log(`📥 [API_REQUEST] Customer ${customerId} requesting Earned History for branch: ${branchId || 'ALL'}`);
        const result = await TransactionHistoryCustomerService.getEarnedPointsHistory(customerId, branchId);

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
