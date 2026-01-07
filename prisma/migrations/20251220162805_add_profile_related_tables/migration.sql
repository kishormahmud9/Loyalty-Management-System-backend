-- CreateEnum
CREATE TYPE "FirstGenStatus" AS ENUM ('yes', 'no', 'not_sure');

-- CreateTable
CREATE TABLE "AcademicInterest" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "intendedMajor" TEXT NOT NULL,
    "whyThisField" TEXT NOT NULL,
    "careerGoals" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyBackground" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "firstGenStatus" "FirstGenStatus",
    "householdIncomeRange" TEXT,
    "householdSize" INTEGER,
    "familySituations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyBackground_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentIdentity" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "raceEthnicity" JSONB,
    "genderIdentity" TEXT,
    "otherIdentityFactors" JSONB,
    "religionOrCulture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayNarrative" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "influentialPerson" TEXT,
    "mistakeAndLesson" TEXT,
    "failureStory" TEXT,
    "issueYouCareAbout" TEXT,
    "whatMakesYouDifferent" TEXT,
    "communityChangeIdea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayNarrative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingPreference" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "writingConfidenceLevel" INTEGER,
    "writingChallenges" JSONB,
    "aiHelpPreferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniqueExperience" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "hobbies" TEXT,
    "uniqueExperiences" TEXT,
    "proudMoment" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniqueExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicInterest_userProfileId_key" ON "AcademicInterest"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyBackground_userProfileId_key" ON "FamilyBackground"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentIdentity_userProfileId_key" ON "StudentIdentity"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EssayNarrative_userProfileId_key" ON "EssayNarrative"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "WritingPreference_userProfileId_key" ON "WritingPreference"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "UniqueExperience_userProfileId_key" ON "UniqueExperience"("userProfileId");

-- AddForeignKey
ALTER TABLE "AcademicInterest" ADD CONSTRAINT "AcademicInterest_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyBackground" ADD CONSTRAINT "FamilyBackground_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentIdentity" ADD CONSTRAINT "StudentIdentity_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayNarrative" ADD CONSTRAINT "EssayNarrative_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingPreference" ADD CONSTRAINT "WritingPreference_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueExperience" ADD CONSTRAINT "UniqueExperience_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
