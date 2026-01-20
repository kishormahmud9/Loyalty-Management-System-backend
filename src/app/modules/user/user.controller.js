
import { createUserService, UserService } from "./user.service.js";

import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import DevBuildError from "../../lib/DevBuildError.js";
import prisma from "../../prisma/client.js";


const registerUser = async (req, res, next) => {
  try {
    const picture = req.file?.path || null;
    const payload = {
      prisma,
      ...req.body,
      picture,
    };

    const result = await createUserService(payload);

    sendResponse(res, {
      success: true,
      message: "User created successfully",
      statusCode: StatusCodes.CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;

    const user = await UserService.findUserInfoById(prisma, userId);

    if (!user) {
      throw new DevBuildError("User not found", 404);
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User information retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};



// User details by ID
const userDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await UserService.findByIdWithProfile(prisma, id);

    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User details retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsersWithProfile = async (req, res) => {
  try {
    const users = await UserService.findAllWithProfile(prisma);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("getAllUsersWithProfile error:", error);
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch users",
      data: null,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, ...data } = req.body;

    if (!userId) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "userId required",
        data: null,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update user",
      data: null,
    });
  }
};

export const UserController = { registerUser, userDetails, getAllUsersWithProfile, updateUser, getUserInfo };
