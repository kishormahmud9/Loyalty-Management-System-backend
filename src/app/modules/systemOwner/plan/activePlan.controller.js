import { getActivePlanForBusinessService } from "./activePlan.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

export const getActivePlanForBusiness = async (req, res) => {
  const { businessId } = req.params;

  const result = await getActivePlanForBusinessService(businessId);

  if (result.error) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: result.error,
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Active plan fetched successfully",
    data: result,
  });
};
