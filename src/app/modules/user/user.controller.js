
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

    res.json({
      success: true,
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsersWithProfile = async (req, res) => {
  try {
    const users = await UserService.findAllWithProfile(prisma);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("getAllUsersWithProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, ...data } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const UserController = { registerUser, userDetails, getAllUsersWithProfile, updateUser, getUserInfo };
