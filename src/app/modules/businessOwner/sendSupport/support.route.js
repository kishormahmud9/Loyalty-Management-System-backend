import express from "express";
import SupportController from "./support.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";


const router = express.Router();

router.post(
    "/create",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    SupportController.create
);
router.get("/", SupportController.getAll);
router.get("/:id", SupportController.getOne);

export const BusinessOwnerSupport = router;
