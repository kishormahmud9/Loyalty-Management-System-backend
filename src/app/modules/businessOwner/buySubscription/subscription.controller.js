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

const getAllAvailablePlans = async (req, res) => {
    try {
        const result = await SubscriptionServices.getAllAvailablePlansFromDB();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Available plans retrieved successfully",
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

const getMySubscriptions = async (req, res) => {
    try {
        const { id: ownerId } = req.user;
        const result = await SubscriptionServices.getMySubscriptionHistoryFromDB(ownerId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Your subscription history retrieved successfully",
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
const getCurrentSubscription = async (req, res) => {
    try {
        const { businessId } = req.user;
        const result = await SubscriptionServices.getCurrentSubscriptionFromDB(businessId);
        
        if (!result) {
            return sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "No active subscription found",
                data: null,
            });
        }

        // Determine plan type (monthly/yearly) based on stripe price or other logic
        const planType = result.stripePriceId === result.plan.stripeYearlyPriceId ? "Yearly" : "Monthly";

        let renewalDate = result.endDate;

        // Fallback for old records where endDate (renewalDate) might be null
        if (!renewalDate && result.startDate) {
            renewalDate = new Date(result.startDate);
            if (planType === "Yearly") {
                renewalDate.setDate(renewalDate.getDate() + 365);
            } else {
                renewalDate.setDate(renewalDate.getDate() + 30);
            }
        }

        const formattedData = {
            name: result.plan.name,
            status: result.status,
            planType: planType,
            renewalDate: renewalDate,
        };

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Current subscription retrieved successfully",
            data: formattedData,
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
    getAllAvailablePlans,
    getMySubscriptions,
    getCurrentSubscription
};
