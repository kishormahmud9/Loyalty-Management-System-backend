import express from "express";
import { CustomerController } from "./customer.controller.js";


import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";
import { customerProfileUpload } from "../../../config/customerProfileUpload.js";


const router = express.Router();

router.post("/register", CustomerController.registerCustomer);
router.get("/profile/me", customerAuthMiddleware, CustomerController.getCustomerInfo);
router.get("/my-branches", customerAuthMiddleware, CustomerController.getMyBranches);


router.get("/details/:id", customerAuthMiddleware, CustomerController.getCustomerWithBranches);

router.post("/update", customerAuthMiddleware, CustomerController.updateCustomer);

router.post("/register-branch", customerAuthMiddleware, CustomerController.registerToNewBranch);
router.post("/switch-branch", customerAuthMiddleware, CustomerController.switchBranch);
router.patch("/update-profile", customerAuthMiddleware, customerProfileUpload.single("avatar"), CustomerController.updateProfile);


export const CustomerRoutes = router;
