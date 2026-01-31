
import express from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";
import { ClaimRewardControllerCustomer } from "./rewards.controller.js";


const router = express.Router();

router.get(
    "/branch-rewards",
    customerAuthMiddleware,
    ClaimRewardControllerCustomer.getBranchRewards
);

router.get(
    "/branch-rewards/:branchId",
    customerAuthMiddleware,
    ClaimRewardControllerCustomer.getRedeemRewardsByBranch
);

router.post(
    "/claim/:rewardId",
    customerAuthMiddleware,
    ClaimRewardControllerCustomer.claimReward
);

router.get(
    "/all-rewards",
    customerAuthMiddleware,
    ClaimRewardControllerCustomer.getRewardsWithClaimStatus
);

router.get(
    "/all-rewards/:branchId",
    customerAuthMiddleware,
    ClaimRewardControllerCustomer.getRewardsWithClaimStatus
);

export const ClaimRewardCustomer = router;
