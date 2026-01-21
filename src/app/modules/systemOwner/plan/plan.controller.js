import {
  activatePlanForBusinessService,
  createPlanService,
  getAllPlansService,
} from "./plan.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

export const getAllPlans = async (req, res) => {
  try {
    const data = await getAllPlansService();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Plans fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Plan Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch plans",
      data: [],
    });
  }
};

export const activatePlanForBusiness = async (req, res) => {
  const { businessId, planId } = req.body;

  if (!businessId || !planId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "businessId and planId are required",
      data: null,
    });
  }

  const result = await activatePlanForBusinessService({
    businessId,
    planId,
    userId: req.user?.id || "SYSTEM",
  });

  if (result.error) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: result.error,
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plan activated successfully",
    data: result.subscription,
  });
};

export const createPlan = async (req, res) => {
  const result = await createPlanService(req.body);

  if (result.error) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: result.error,
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Plan created successfully",
    data: result.plan,
  });
};
