import * as transactionService from "./transaction.service.js";

export const getStaffTransactions = async (req, res) => {
  try {
    const data = await transactionService.getStaffTransactions(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    // ⚠️ Server NEVER goes down
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to load transactions",
      data: {
        transactions: [],
        pagination: {},
      },
    });
  }
};

export const requestUndo = async (req, res) => {
  try {
    const data = await transactionService.requestUndo(req);

    return res.status(200).json({
      success: true,
      message: "Undo request submitted successfully",
      data,
    });
  } catch (error) {
    // ⚠️ Server NEVER goes down
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to submit undo request",
    });
  }
};
