// redeemReward.controller.js
import RedeemRewardService from "./redeemReward.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class RedeemRewardController {
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

      const redeemReward = await RedeemRewardService.createRedeemReward({
        rewardName: req.body.rewardName,
        rewardPoints: req.body.rewardPoints,
        rewardType: req.body.rewardType,   // FREE_ITEM / Free Item / etc
        earningRule: req.body.earningRule, // PURCHASE / PER_PURCHASE
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
        message: "Redeem Reward created successfully",
        data: redeemReward,
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
      const redeemRewards = await RedeemRewardService.getAllRedeemRewards();
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Redeem Rewards retrieved successfully",
        data: redeemRewards,
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
      const redeemReward = await RedeemRewardService.getRedeemRewardById(req.params.id);

      if (!redeemReward) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Redeem Reward not found",
          data: null,
        });
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Redeem Reward retrieved successfully",
        data: redeemReward,
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
      const redeemRewards = await RedeemRewardService.getRedeemRewardsByBusiness(
        req.params.businessId
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business redeem rewards retrieved successfully",
        data: redeemRewards,
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
      const redeemRewards = await RedeemRewardService.getRedeemRewardsByBranch(
        req.params.branchId
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch redeem rewards retrieved successfully",
        data: redeemRewards,
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
      const redeemRewardId = req.params.id;

      // 🖼️ IMAGE HANDLING
      let rewardImageFilePath = undefined;
      let rewardImage = undefined;

      if (req.file) {
        rewardImageFilePath = req.file.path.replace(/\\/g, "/");
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        rewardImage = `${baseUrl}/${rewardImageFilePath}`;
      }

      const updatedRedeemReward = await RedeemRewardService.updateRedeemReward(
        redeemRewardId,
        {
          ...req.body,
          rewardImageFilePath,
          rewardImage,
        }
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Redeem Reward updated successfully",
        data: updatedRedeemReward,
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
      await RedeemRewardService.deleteRedeemReward(req.params.id);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Redeem Reward deleted successfully",
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

export default RedeemRewardController;
