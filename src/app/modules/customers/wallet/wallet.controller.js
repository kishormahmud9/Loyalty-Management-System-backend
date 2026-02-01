import httpStatus from "http-status-codes";
import CustomerWalletService from "./wallet.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";


const getGoogleWalletLink = async (req, res) => {
   try {
     const customerId = req.user.id; // From auth middleware
    const { cardId } = req.params;

    const result = await CustomerWalletService.getGoogleWalletLink(customerId, cardId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Google Wallet link generated successfully",
        data: result,
    });
   } catch (error) {
     sendResponse(res, {
        statusCode: httpStatus.OK,
        success: false,
        message: "Google Wallet link generated failed",
        data: error.message,
    });
   }
}

export const CustomerWalletController = {
    getGoogleWalletLink,
};
