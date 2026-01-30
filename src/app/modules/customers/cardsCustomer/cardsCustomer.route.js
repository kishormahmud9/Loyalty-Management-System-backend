import express from "express";
import CustomerCardController from "./cardsCustomer.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Get all cards for a business
router.get(
    "/business/:businessId",
    // authenticate, // Optional: depends if public or restricted
    CustomerCardController.getByBusiness
);

// Get single card details
router.get(
    "/:id",
    // authenticate, // Optional: depends if public or restricted
    CustomerCardController.getOne
);

export const CustomerCardRoutes = router;
