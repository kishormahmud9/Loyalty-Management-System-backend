import { createCustomerService, CustomerService } from "./customer.service.js";
import { StatusCodes } from "http-status-codes";


import { sendResponse } from "../../../utils/sendResponse.js";
import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { envVars } from "../../../config/env.js";


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
    const customerId = req.user.id; // Strictly use logged-in user's ID

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
    const customerId = req.user.id; // Strictly use logged-in user's ID
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


const updateCustomer = async (req, res, next) => {
  try {
    const customerId = req.user.id; // Strictly use logged-in user's ID
    const data = req.body;

    const updatedCustomer = await CustomerService.update(prisma, customerId, data);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
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

const updateProfile = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const data = req.body;

    // Handle file upload
    if (req.file) {
      data.avatarFilePath = req.file.path;
      data.avatarUrl = `${envVars.SERVER_URL}/${req.file.path.replace(/\\/g, "/")}`;
    }

    // Remove fields that should not be updated via this route
    delete data.id;
    delete data.passwordHash;
    delete data.role;
    delete data.isVerified;
    delete data.qrCode;
    delete data.qrCodePath;
    delete data.qrCodeUrl;

    const updatedCustomer = await CustomerService.update(prisma, customerId, data);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

const switchBranch = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { branchId } = req.body;

    if (!branchId) {
      throw new AppError(400, "branchId is required");
    }

    const result = await CustomerService.setActiveBranch(prisma, customerId, branchId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Branch switched successfully",
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
  registerToNewBranch,
  updateProfile,
  switchBranch
};

