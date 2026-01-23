// earnReward.controller.js
import EarnRewardService from "./earnReward.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class EarnRewardController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            const { businessId, branchId } = req.body;

            if (!userId) {
                return sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: "Unauthorized",
                    data: null,
                });
            }

            if (!businessId || !branchId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "businessId and branchId are required",
                    data: null,
                });
            }

            // 🖼️ IMAGE HANDLING
            let rewardImageFilePath = null;
            let rewardImage = null;

            if (req.file) {
                rewardImageFilePath = req.file.path.replace(/\\/g, "/");
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                rewardImage = `${baseUrl}/${rewardImageFilePath}`;
            }

            const earnReward = await EarnRewardService.createEarnReward({
                rewardName: req.body.rewardName,
                earnPoint: req.body.earnPoint,
                rewardType: req.body.rewardType,
                earningRule: req.body.earningRule,
                expiryDays: req.body.expiryDays,
                reward: req.body.reward,

                userId,
                businessId,
                branchId,

                rewardImageFilePath,
                rewardImage,
            });

            return sendResponse(res, {
                statusCode: 201,
                success: true,
                message: "Earn Reward created successfully",
                data: earnReward,
            });
        } catch (error) {
            return sendResponse(res, {
                statusCode: error.statusCode || 400,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getAll(req, res) {
        try {
            const earnRewards = await EarnRewardService.getAllEarnRewards();
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Earn Rewards retrieved successfully",
                data: earnRewards,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getOne(req, res) {
        try {
            const earnReward = await EarnRewardService.getEarnRewardById(req.params.id);

            if (!earnReward) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Earn Reward not found",
                    data: null,
                });
            }

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Earn Reward retrieved successfully",
                data: earnReward,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getByBusiness(req, res) {
        try {
            const earnRewards = await EarnRewardService.getEarnRewardsByBusiness(
                req.params.businessId
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Business earn rewards retrieved successfully",
                data: earnRewards,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getByBranch(req, res) {
        try {
            const earnRewards = await EarnRewardService.getEarnRewardsByBranch(
                req.params.branchId
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Branch earn rewards retrieved successfully",
                data: earnRewards,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;

            // 🖼️ IMAGE HANDLING
            let rewardImageFilePath = undefined;
            let rewardImage = undefined;

            if (req.file) {
                rewardImageFilePath = req.file.path.replace(/\\/g, "/");
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                rewardImage = `${baseUrl}/${rewardImageFilePath}`;
            }

            const updatedEarnReward = await EarnRewardService.updateEarnReward(
                id,
                {
                    ...req.body,
                    rewardImageFilePath,
                    rewardImage,
                }
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Earn Reward updated successfully",
                data: updatedEarnReward,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 400,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async remove(req, res) {
        try {
            await EarnRewardService.deleteEarnReward(req.params.id);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Earn Reward deleted successfully",
                data: null,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }
}

export default EarnRewardController;
