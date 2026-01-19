import { SubscriptionServices } from "./subscription.service.js";

const createSubscription = async (req, res) => {
    try {
        const result = await SubscriptionServices.createSubscriptionIntoDB(req.body);
        res.status(200).json({
            success: true,
            message: "Subscription created successfully",
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong",
            error: err,
        });
    }
};

const getAllSubscription = async (req, res) => {
    try {
        const result = await SubscriptionServices.getAllSubscriptionFromDB();
        res.status(200).json({
            success: true,
            message: "Subscriptions retrieved successfully",
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong",
            error: err,
        });
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SubscriptionServices.getSubscriptionByIdFromDB(id);
        res.status(200).json({
            success: true,
            message: "Subscription retrieved successfully",
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong",
            error: err,
        });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SubscriptionServices.updateSubscriptionIntoDB(id, req.body);
        res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong",
            error: err,
        });
    }
};

export const SubscriptionControllers = {
    createSubscription,
    getAllSubscription,
    getSubscriptionById,
    updateSubscription,
};
