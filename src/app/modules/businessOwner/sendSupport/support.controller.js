import SupportService from "./support.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class SupportController {
  static async create(req, res) {
    try {
      const { businessId } = req.user;
      const support = await SupportService.createSupport({
        ...req.body,
        userId: req.user.id,
        businessId,
      });
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Support ticket created successfully",
        data: support,
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
      const supports = await SupportService.getAllSupport();
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Support tickets retrieved successfully",
        data: supports,
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
      const support = await SupportService.getSupportById(req.params.id);

      if (!support) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Support ticket not found",
          data: null,
        });
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Support ticket retrieved successfully",
        data: support,
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

export default SupportController;
