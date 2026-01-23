import { createCustomerService, CustomerService } from "./customer.service.js";
import { StatusCodes } from "http-status-codes";


import { sendResponse } from "../../../utils/sendResponse.js";
import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";


const registerCustomer = async (req, res, next) => {
  try {
    const picture = req.file?.path || null;
    const payload = {
      prisma,
      ...req.body,
      picture,
    };

    const result = await createCustomerService(payload);

    sendResponse(res, {
      success: true,
      message: "Customer registered successfully",
      statusCode: StatusCodes.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerInfo = async (req, res, next) => {
  try {
    const customerId = req.params.id || req.user.id;

    const customer = await CustomerService.findCustomerInfoById(prisma, customerId);

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Customer information retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerWithBranches = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await CustomerService.findByIdWithBranches(prisma, id);

    if (!customer) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Customer not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Customer branch details retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBranches = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const customer = await CustomerService.findByIdWithBranches(prisma, customerId);

    if (!customer) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Customer not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Your registered branches retrieved successfully",
      data: customer.branchData,
    });
  } catch (error) {
    next(error);
  }
};


const updateCustomer = async (req, res) => {
  try {
    const { customerId, ...data } = req.body;

    if (!customerId) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "customerId required",
        data: null,
      });
    }

    const updatedCustomer = await CustomerService.update(prisma, customerId, data);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("updateCustomer error:", error);
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update customer",
      data: null,
    });
  }
};

const registerToNewBranch = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { businessId, branchId } = req.body;

    if (!businessId || !branchId) {
      throw new AppError(400, "businessId and branchId are required");
    }

    const result = await CustomerService.registerToBranch(prisma, customerId, businessId, branchId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Customer registered to branch successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const CustomerController = {
  registerCustomer,
  getCustomerInfo,
  getCustomerWithBranches,
  getMyBranches,
  updateCustomer,
  registerToNewBranch
};

