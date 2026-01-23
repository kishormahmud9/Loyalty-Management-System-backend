import * as transactionService from "./transaction.service.js";

export const getBranchTransactions = async (req, res) => {
  try {
    const data = await transactionService.getBranchTransactions(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch transactions",
    });
  }
};

export const requestUndo = async (req, res) => {
  try {
    const data = await transactionService.requestUndo(req);
    return res.status(201).json({
      success: true,
      message: "Undo request submitted",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit undo request",
    });
  }
};