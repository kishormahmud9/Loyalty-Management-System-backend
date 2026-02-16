import express from "express";
import CardController from "./cards.controller.js";
import {
  authenticate,
  authorize,
  businessScope,
} from "../../../middleware/auth.middleware.js";
import { enforceSubscription } from "../../../middleware/enforceSubscription.js";
import { PERMISSIONS } from "../../../config/permissions.js";
import { upload } from "../../../utils/fileUpload.js";

const router = express.Router();

const cardUploadFields = [
  { name: "logo", maxCount: 1 },
  { name: "cardBackground", maxCount: 1 },
  { name: "stampBackground", maxCount: 1 },
  { name: "activeStamp", maxCount: 1 },
  { name: "inactiveStamp", maxCount: 1 },
];

router.post(
  "/create",
  authenticate,
  authorize(PERMISSIONS.CARD.CREATE),
  upload.fields(cardUploadFields),
  businessScope,
  enforceSubscription,
  CardController.create,
);

router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.READ),
  businessScope,
  enforceSubscription,
  CardController.getByBusiness,
);

router.get(
  "/business",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.READ),
  businessScope,
  enforceSubscription,
  CardController.getByBusiness,
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CARD.READ),
  businessScope,
  enforceSubscription,
  CardController.getOne,
);

router.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CARD.UPDATE),
  upload.fields(cardUploadFields),
  businessScope,
  enforceSubscription,
  CardController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CARD.DELETE),
  businessScope,
  enforceSubscription,
  CardController.remove,
);

export const CardRoutes = router;
