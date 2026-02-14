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
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || "Google Wallet link generation failed",
            data: null,
        });
    }
}

const getAppleWalletLink = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { cardId } = req.params;

        const result = await CustomerWalletService.getAppleWalletLink(customerId, cardId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Apple Wallet link generated successfully",
            data: result,
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || "Apple Wallet link generation failed",
            data: null,
        });
    }
}

const addAppleWallet = async (req, res) => {
    try {
        const { walletId } = req.params;

        const { buffer, filename } = await CustomerWalletService.getAppleWalletPass(walletId);

        // Set headers for .pkpass download
        res.setHeader("Content-Type", "application/vnd.apple.pkpass");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        return res.status(httpStatus.OK).send(buffer);
    } catch (error) {
        sendResponse(res, {
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || "Apple Wallet pass generation failed",
            data: null,
        });
    }
}

const getWalletHistory = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await CustomerWalletService.getWalletHistory(customerId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Wallet history retrieved successfully",
            data: result,
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || "Failed to retrieve wallet history",
            data: null,
        });
    }
}

const getMyWallets = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await CustomerWalletService.getMyWallets(customerId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Your added wallets retrieved successfully",
            data: result,
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message || "Failed to retrieve your wallets",
            data: null,
        });
    }
}

export const CustomerWalletController = {
    getGoogleWalletLink,
    getAppleWalletLink,
    addAppleWallet,
    getWalletHistory,
    getMyWallets
};
