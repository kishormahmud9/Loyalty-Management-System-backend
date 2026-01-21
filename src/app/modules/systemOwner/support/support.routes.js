import { Router } from "express";
import {
  getSystemOwnerSupportTickets,
  getSystemOwnerSupportTicketById,
  updateSystemOwnerSupportTicketStatus,
} from "../../systemOwner/support/support.controller.js";

const router = Router();

router.get("/", getSystemOwnerSupportTickets);

router.get("/:id", getSystemOwnerSupportTicketById);

router.patch("/:id/status", updateSystemOwnerSupportTicketStatus);

export const SupportRoutes = router;
