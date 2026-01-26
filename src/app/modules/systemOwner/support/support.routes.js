import { Router } from "express";
import {
  getSystemOwnerSupportTickets,
  getSystemOwnerSupportTicketById,
  updateSystemOwnerSupportTicketStatus,
} from "../../systemOwner/support/support.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  getSystemOwnerSupportTickets,
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  getSystemOwnerSupportTicketById,
);

router.patch(
  "/:id/status",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  updateSystemOwnerSupportTicketStatus,
);

export const SupportRoutes = router;
