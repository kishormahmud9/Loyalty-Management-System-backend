import {
  getSystemOwnerSupportTicketsService,
  getSystemOwnerSupportTicketByIdService,
  updateSystemOwnerSupportTicketStatusByIdService,
} from "../../systemOwner/support/support.service.js";

import { sendResponse } from "../../../utils/sendResponse.js";

/* 
   LIST SUPPORT TICKETS
 */
export const getSystemOwnerSupportTickets = async (req, res) => {
  try {
    const data = await getSystemOwnerSupportTicketsService(req.query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Support tickets fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Support List Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch support tickets",
      data: null,
    });
  }
};

/* 
   VIEW SUPPORT TICKET (VIEW BUTTON)
 */
export const getSystemOwnerSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await getSystemOwnerSupportTicketByIdService(id);

    if (!ticket) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Support ticket not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Support ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Support View Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch support ticket",
      data: null,
    });
  }
};

/* 
   UPDATE SUPPORT TICKET STATUS
 */
export const updateSystemOwnerSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    if (!allowedStatus.includes(status)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid support ticket status",
        data: null,
      });
    }

    const updatedTicket = await updateSystemOwnerSupportTicketStatusByIdService(
      id,
      status,
    );

    if (!updatedTicket) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Support ticket not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Support ticket status updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Support Status Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update support ticket status",
      data: null,
    });
  }
};
