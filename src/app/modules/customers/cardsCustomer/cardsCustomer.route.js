import express from "express";
import CustomerCardController from "./cardsCustomer.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

// Get all cards for a business
router.get(
    "/business/:businessId",
    customerAuthMiddleware,
    CustomerCardController.getByBusiness
);

// Get all cards for the logged-in customer
router.get(
    "/my-cards",
    customerAuthMiddleware,
    CustomerCardController.getMyCards
);

// Get single card details
router.get(
    "/:id",
    // authenticate, // Optional: depends if public or restricted
    CustomerCardController.getOne
);

export const CustomerCardRoutes = router;
