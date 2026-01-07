import express from "express";
import { ProfileController } from "./profile.controller.js";

const router = express.Router();

router.post("/upsert", ProfileController.upsertUserProfile);

router.post("/academic-interest", ProfileController.academicInterest);

router.post(
  "/scholarship-preferences",
  ProfileController.addScholarshipSpecificInfo
);

router.post(
  "/activities",
  ProfileController.addExtraCurricularActivities
);

router.post(
  "/unique-experiences",
  ProfileController.addUniqueExperiences
);

router.post(
  "/essays",
  ProfileController.addSpecificQuestions
);

router.post("/diversity", ProfileController.addDiversity);

router.post("/education", ProfileController.createEducation);

router.put("/education/:id", ProfileController.editEducation);

export const ProfileRoutes = router;
