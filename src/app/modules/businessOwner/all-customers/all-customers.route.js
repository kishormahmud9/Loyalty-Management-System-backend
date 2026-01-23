import { Router } from "express";
import AllCustomersController from "./all-customers.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// Apply auth middleware to all routes in this module
router.use(checkAuthMiddleware(Role.BUSINESS_OWNER));

// Route to get all customers for the logged-in business owner
router.get("/all", AllCustomersController.getAllCustomersByBusiness);

// Route to get a single customer by ID
router.get("/customer/:customerId", AllCustomersController.getSingleCustomer);

// Route to delete a customer by ID
router.delete("/customer/:customerId", AllCustomersController.deleteCustomer);

export const AllCustomersRoutes = router;
