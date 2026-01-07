import express from "express";
import { authenticateUser } from "../../middleware/authMiddleware.js";
import { UserController } from "./user.controller.js";

const router = express.Router();

router.post("/register", UserController.registerUser);

router.get("/profile", authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

router.get("/user-details/:id", authenticateUser, UserController.userDetails);

router.get("/users", authenticateUser, UserController.getAllUsersWithProfile);

router.post("/update-user", authenticateUser, UserController.updateUser);

router.post("/volunteer-work", authenticateUser, UserController.addVolunteerWork);

router.post(
  "/family-background",
  authenticateUser,
  UserController.addFamilyBackground
);

router.post("/work", authenticateUser, UserController.addStudentWork);
router.put("/work/:id", authenticateUser, UserController.editStudentWork);
router.delete("/work/:id", authenticateUser, UserController.deleteStudentWork);

router.post("/award", authenticateUser, UserController.addStudentAward);
router.put("/award/:id", authenticateUser, UserController.editStudentAward);
router.delete("/award/:id", authenticateUser, UserController.deleteStudentAward);

router.post("/challenge", authenticateUser, UserController.addStudentChallenge);
router.put(
  "/challenge/:id",
  authenticateUser,
  UserController.editStudentChallenge
);
router.delete(
  "/challenge/:id",
  authenticateUser,
  UserController.deleteStudentChallenge
);

router.post("/essay", authenticateUser, UserController.addEssay);
router.put("/essay/:id", authenticateUser, UserController.editEssay);
router.delete("/essay/:id", authenticateUser, UserController.deleteEssay);

router.post(
  "/essay-narrative",
  authenticateUser,
  UserController.upsertEssayNarrative
);

router.post(
  "/writing-preference",
  authenticateUser,
  UserController.upsertWritingPreference
);

router.post(
  "/profile-progress",
  authenticateUser,
  UserController.updateProfileProgress
);

export const UserRoutes = router;
