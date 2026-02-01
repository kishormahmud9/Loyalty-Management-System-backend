import {
  setStaffPinService,
  staffLoginService,
  staffPinLoginService,
} from "./staff.auth.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

export const staffLogin = async (req, res) => {
  try {
    const result = await staffLoginService(req.prisma, req.body);

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
      message: "Staff login successful",

      data: {
        token: result.token,
        requirePinSetup: result.requirePinSetup,
        branchId: result.branchId,
      },
    });
  } catch (error) {
    console.error("Staff Login Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

export const setStaffPin = async (req, res) => {
  try {
    const result = await setStaffPinService(req.prisma, req.user.id, req.body);

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
      message: "PIN set successfully",
      data: null,
    });
  } catch (error) {
    console.error("Set PIN Controller Error:", error.message);
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

export const staffPinLogin = async (req, res) => {
  try {
    const result = await staffPinLoginService(req.prisma, req.body);

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
      message: "PIN login successful",
      data: {
        token: result.token,
      },
    });
  } catch (error) {
    console.error("PIN Login Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};
