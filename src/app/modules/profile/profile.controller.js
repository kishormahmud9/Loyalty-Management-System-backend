import { ProfileService } from "./profile.service.js";


 const upsertUserProfile = async (req, res) => {
  try {
    const { userId, ...data } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const profile = await ProfileService.upsertByUserId(
      req.prisma,
      userId,
      data
    );

    res.json({
      success: true,
      message: "User profile saved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("upsertUserProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save user profile",
    });
  }
};
 const academicInterest = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, intendedMajor, whyThisField, careerGoals } =
      req.body;

    const result = await prisma.academicInterest.upsert({
      where: { userProfileId },
      update: {
        intendedMajor,
        whyThisField,
        careerGoals,
      },
      create: {
        userProfileId,
        intendedMajor,
        whyThisField,
        careerGoals,
      },
    });

    return res.json({
      success: true,
      message: "Academic interest saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("academicInterest error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save academic interest",
    });
  }
};
 const addExtraCurricularActivities = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, activityName, role, impact } = req.body;

    const activity = await prisma.studentActivity.create({
      data: {
        userProfileId,
        activityName,
        role,
        impact,
      },
    });

    return res.json({
      success: true,
      message: "Activity added successfully",
      data: activity,
    });
  } catch (error) {
    console.error("addExtraCurricularActivities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add activity",
    });
  }
};

 const addUniqueExperiences = async (req, res) => {
  try {
    const prisma = req.prisma;
    const {
      userProfileId,
      hobbies,
      uniqueExperiences,
      proudMoment,
      additionalNotes,
    } = req.body;

    const result = await prisma.uniqueExperience.upsert({
      where: { userProfileId },
      update: {
        hobbies,
        uniqueExperiences,
        proudMoment,
        additionalNotes,
      },
      create: {
        userProfileId,
        hobbies,
        uniqueExperiences,
        proudMoment,
        additionalNotes,
      },
    });

    return res.json({
      success: true,
      message: "Unique experiences saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("addUniqueExperiences error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save unique experiences",
    });
  }
};


 const addScholarshipSpecificInfo = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, interestTypes, deadlineTimeline } = req.body;

    const result = await prisma.studentScholarshipInterest.upsert({
      where: { userProfileId },
      update: {
        interestTypes,
        deadlineTimeline,
      },
      create: {
        userProfileId,
        interestTypes,
        deadlineTimeline,
      },
    });

    return res.json({
      success: true,
      message: "Scholarship preferences saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("addScholarshipSpecificInfo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save scholarship preferences",
    });
  }
};

 const addSpecificQuestions = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, question, answer } = req.body;

    const essay = await prisma.essay.create({
      data: {
        userProfileId,
        question,
        answer,
      },
    });

    return res.json({
      success: true,
      message: "Specific question added successfully",
      data: essay,
    });
  } catch (error) {
    console.error("addSpecificQuestions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add specific question",
    });
  }
};

 const addDiversity = async (req, res) => {
  try {
    const prisma = req.prisma;
    const {
      userProfileId,
      raceEthnicity,
      genderIdentity,
      otherIdentityFactors,
      religionOrCulture,
    } = req.body;

    const result = await prisma.studentIdentity.upsert({
      where: { userProfileId },
      update: {
        raceEthnicity,
        genderIdentity,
        otherIdentityFactors,
        religionOrCulture,
      },
      create: {
        userProfileId,
        raceEthnicity,
        genderIdentity,
        otherIdentityFactors,
        religionOrCulture,
      },
    });

    return res.json({
      success: true,
      message: "Student identity saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("addDiversity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save student identity",
    });
  }
};




 const createEducation = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userProfileId, institutionName, level, startYear, endYear } =
      req.body;

    const education = await prisma.education.create({
      data: {
        userProfileId,
        institutionName,
        level,
        startYear,
        endYear,
      },
    });

    return res.json({
      success: true,
      message: "Education added successfully",
      data: education,
    });
  } catch (error) {
    console.error("createEducation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add education",
    });
  }
};

 const editEducation = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id, ...data } = req.body;

    const updatedEducation = await prisma.education.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: "Education updated successfully",
      data: updatedEducation,
    });
  } catch (error) {
    console.error("editEducation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update education",
    });
  }
};

export const ProfileController = {upsertUserProfile, createEducation, editEducation, academicInterest, addExtraCurricularActivities, addUniqueExperiences, addScholarshipSpecificInfo, addSpecificQuestions, addDiversity };  