// reward.controller.js
import RewardService from "./reward.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class RewardController {
  static async create(req, res) {
    try {
      // ✅ userId MUST come from auth
      const userId = req.user?.id;

      if (!userId) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized",
          data: null,
        });
      }

      const reward = await RewardService.createReward({
        ...req.body,
        userId, // 🔥 inject userId safely
      });

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Reward created successfully",
        data: reward,
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

  static async getAll(req, res) {
    try {
      const rewards = await RewardService.getAllRewards();
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rewards retrieved successfully",
        data: rewards,
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
      const reward = await RewardService.getRewardById(req.params.id);

      if (!reward) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Reward not found",
          data: null,
        });
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reward retrieved successfully",
        data: reward,
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
      const rewards = await RewardService.getRewardsByBusiness(
        req.params.businessId
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business rewards retrieved successfully",
        data: rewards,
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
      const rewards = await RewardService.getRewardsByBranch(
        req.params.branchId
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch rewards retrieved successfully",
        data: rewards,
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
    const rewardId = req.params.id;

    const updatedReward = await RewardService.updateReward(
      rewardId,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reward updated successfully",
      data: updatedReward,
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
      await RewardService.deleteReward(req.params.id);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reward deleted successfully",
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

export default RewardController;
