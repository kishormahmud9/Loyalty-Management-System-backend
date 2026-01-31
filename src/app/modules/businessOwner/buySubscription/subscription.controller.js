import { SubscriptionServices } from "./subscription.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

const createSubscription = async (req, res) => {
    try {
        const { businessId } = req.user;
        const result = await SubscriptionServices.createSubscriptionIntoDB({
            ...req.body,
            businessId
        });
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Subscription created successfully",
            data: result,
        });
    } catch (err) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: err.message || "Something went wrong",
            data: null,
        });
    }
};

const getAllSubscription = async (req, res) => {
    try {
        const result = await SubscriptionServices.getAllSubscriptionFromDB();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Subscriptions retrieved successfully",
            data: result,
        });
    } catch (err) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: err.message || "Something went wrong",
            data: null,
        });
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SubscriptionServices.getSubscriptionByIdFromDB(id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Subscription retrieved successfully",
            data: result,
        });
    } catch (err) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: err.message || "Something went wrong",
            data: null,
        });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SubscriptionServices.updateSubscriptionIntoDB(id, req.body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Subscription updated successfully",
            data: result,
        });
    } catch (err) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: err.message || "Something went wrong",
            data: null,
        });
    }
};

export const SubscriptionControllers = {
    createSubscription,
    getAllSubscription,
    getSubscriptionById,
    updateSubscription,
};
