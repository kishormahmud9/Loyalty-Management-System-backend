import RewardService from "./reward.service.js";

class RewardController {
  static async create(req, res) {
    try {
      const reward = await RewardService.createReward(req.body);
      res.status(201).json(reward);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const rewards = await RewardService.getAllRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getOne(req, res) {
    try {
      const reward = await RewardService.getRewardById(req.params.id);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      res.json(reward);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getByBusiness(req, res) {
    try {
      const rewards = await RewardService.getRewardsByBusiness(
        req.params.businessId
      );
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getByBranch(req, res) {
    try {
      const rewards = await RewardService.getRewardsByBranch(
        req.params.branchId
      );
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async remove(req, res) {
    try {
      await RewardService.deleteReward(req.params.id);
      res.json({ message: "Reward deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default RewardController;
