import { BusinessRewardHistoryService } from "./rewardHistory.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const increasePoints = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const { branchId } = req.params;
        const { qrCode, rewardHistoryId, points } = req.body;
        const { businessId } = req.user;
        const result = await BusinessRewardHistoryService.increaseRewardPoints({
            ...req.body,
            qrCode,
            branchId,
            businessId,
            rewardHistoryId,
            points,
            loggedInUserId
        });

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Reward points increased successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getCustomerBranchHistory = async (req, res, next) => {
    try {
        const { customerId, branchId } = req.params;
        const result = await BusinessRewardHistoryService.getRewardHistoryByBranch(customerId, branchId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Customer reward history retrieved",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const scanByQr = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const { qrCode, branchId } = req.query;
        const { businessId } = req.user;
        const result = await BusinessRewardHistoryService.getHistoryByQrCode({
            qrCode,
            branchId,
            businessId,
            loggedInUserId
        });

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "QR scan successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const updatePoints = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const { id } = req.params;
        const { points } = req.body;
        const { businessId } = req.user;
        const result = await BusinessRewardHistoryService.updatePointsById({
            id,
            points,
            loggedInUserId,
            businessId
        });

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Reward points updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const findCustomerByQr = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const { qrCode } = req.params;

        const result = await BusinessRewardHistoryService.findCustomerByQr({
            qrCode,
            loggedInUserId
        });

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Customer found and history retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export const BusinessRewardHistoryController = {
    increasePoints,
    getCustomerBranchHistory,
    scanByQr,
    updatePoints,
    findCustomerByQr
};
