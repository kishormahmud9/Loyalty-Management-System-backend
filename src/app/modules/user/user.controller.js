
import bcrypt from "bcrypt";
import DevBuildError from "../../lib/DevBuildError.js";
import { UserService } from "./user.service.js";



// ✅ User Registration
 const registerUser = async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");
    const { name, email, password } = req.body;

    const existingUser = await UserService.findByEmail(prisma, email);
    if (existingUser) throw new DevBuildError("Email already exists", 400);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Run everything in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          // status: "active",
          // role: "student",
        },
      });

      return user;
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: result });
  } catch (error) {
    next(error);
  }
};

// User details by ID
 const userDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma; // already injected middleware দিয়ে

    const user = await UserService.findByIdWithProfile(prisma, id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

 const getAllUsersWithProfile = async (req, res) => {
  try {
    const prisma = req.prisma;

    const users = await UserService.findAllWithProfile(prisma);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("getAllUsersWithProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

 const updateUser = async (req, res) => {
  try {
    const prisma = req.prisma;

    const { userId, ...data } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

 const addVolunteerWork = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, organization, timeline } = req.body;

    const volunteer = await prisma.studentVolunteer.create({
      data: {
        userProfileId,
        organization,
        timeline,
      },
    });

    return res.json({
      success: true,
      message: "Volunteer work added successfully",
      data: volunteer,
    });
  } catch (error) {
    console.error("addVolunteerWork error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add volunteer work",
    });
  }
};

 const addFamilyBackground = async (req, res) => {
  try {
    const prisma = req.prisma;
    const {
      userProfileId,
      firstGenStatus,
      householdIncomeRange,
      householdSize,
      familySituations,
    } = req.body;

    const result = await prisma.familyBackground.upsert({
      where: { userProfileId },
      update: {
        firstGenStatus,
        householdIncomeRange,
        householdSize,
        familySituations,
      },
      create: {
        userProfileId,
        firstGenStatus,
        householdIncomeRange,
        householdSize,
        familySituations,
      },
    });

    return res.json({
      success: true,
      message: "Family background saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("addFamilyBackground error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save family background",
    });
  }
};

 const addStudentWork = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, jobTitle, employer, isCurrent } = req.body;

    const work = await prisma.studentWork.create({
      data: {
        userProfileId,
        jobTitle,
        employer,
        isCurrent,
      },
    });

    return res.json({
      success: true,
      message: "Work experience added successfully",
      data: work,
    });
  } catch (error) {
    console.error("addStudentWork error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add work experience",
    });
  }
};

 const editStudentWork = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id, ...data } = req.body;

    const updatedWork = await prisma.studentWork.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: "Work experience updated successfully",
      data: updatedWork,
    });
  } catch (error) {
    console.error("editStudentWork error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update work experience",
    });
  }
};

 const deleteStudentWork = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.body;

    await prisma.studentWork.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Work experience deleted successfully",
    });
  } catch (error) {
    console.error("deleteStudentWork error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete work experience",
    });
  }
};

 const addStudentAward = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, awardName, reason } = req.body;

    const award = await prisma.studentAward.create({
      data: {
        userProfileId,
        awardName,
        reason,
      },
    });

    return res.json({
      success: true,
      message: "Award added successfully",
      data: award,
    });
  } catch (error) {
    console.error("addStudentAward error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add award",
    });
  }
};

 const editStudentAward = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id, ...data } = req.body;

    const updatedAward = await prisma.studentAward.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: "Award updated successfully",
      data: updatedAward,
    });
  } catch (error) {
    console.error("editStudentAward error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update award",
    });
  }
};

 const deleteStudentAward = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.body;

    await prisma.studentAward.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Award deleted successfully",
    });
  } catch (error) {
    console.error("deleteStudentAward error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete award",
    });
  }
};

 const addStudentChallenge = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, challengeType, description } = req.body;

    const challenge = await prisma.studentChallenge.create({
      data: {
        userProfileId,
        challengeType,
        description,
      },
    });

    return res.json({
      success: true,
      message: "Challenge added successfully",
      data: challenge,
    });
  } catch (error) {
    console.error("addStudentChallenge error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add challenge",
    });
  }
};

 const editStudentChallenge = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id, ...data } = req.body;

    const updatedChallenge = await prisma.studentChallenge.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: "Challenge updated successfully",
      data: updatedChallenge,
    });
  } catch (error) {
    console.error("editStudentChallenge error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update challenge",
    });
  }
};

 const deleteStudentChallenge = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.body;

    await prisma.studentChallenge.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Challenge deleted successfully",
    });
  } catch (error) {
    console.error("deleteStudentChallenge error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete challenge",
    });
  }
};

 const addEssay = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, title, question, answer } = req.body;

    const essay = await prisma.essay.create({
      data: {
        userProfileId,
        title,
        question,
        answer,
      },
    });

    return res.json({
      success: true,
      message: "Essay added successfully",
      data: essay,
    });
  } catch (error) {
    console.error("addEssay error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add essay",
    });
  }
};

 const editEssay = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id, ...data } = req.body;

    const updatedEssay = await prisma.essay.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: "Essay updated successfully",
      data: updatedEssay,
    });
  } catch (error) {
    console.error("editEssay error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update essay",
    });
  }
};

 const deleteEssay = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.body;

    await prisma.essay.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Essay deleted successfully",
    });
  } catch (error) {
    console.error("deleteEssay error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete essay",
    });
  }
};

 const upsertEssayNarrative = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, ...data } = req.body;

    const result = await prisma.essayNarrative.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });

    return res.json({
      success: true,
      message: "Essay narrative saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("upsertEssayNarrative error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save essay narrative",
    });
  }
};

 const upsertWritingPreference = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, ...data } = req.body;

    const result = await prisma.writingPreference.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    });

    return res.json({
      success: true,
      message: "Writing preference saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("upsertWritingPreference error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save writing preference",
    });
  }
};

 const updateProfileProgress = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, progressPercent, completedSections } = req.body;

    const result = await prisma.profileProgress.upsert({
      where: { userProfileId },
      update: {
        progressPercent,
        completedSections,
      },
      create: {
        userProfileId,
        progressPercent,
        completedSections,
      },
    });

    return res.json({
      success: true,
      message: "Profile progress updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("updateProfileProgress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile progress",
    });
  }
};


export const UserController = { registerUser,  userDetails , getAllUsersWithProfile, updateUser, addVolunteerWork, addFamilyBackground, addStudentWork, editStudentWork, deleteStudentWork, addStudentAward, editStudentAward, deleteStudentAward, addStudentChallenge, editStudentChallenge, deleteStudentChallenge, addEssay, editEssay, deleteEssay, upsertEssayNarrative, upsertWritingPreference, updateProfileProgress };
