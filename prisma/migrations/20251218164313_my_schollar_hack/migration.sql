/*
  Warnings:

  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `businessId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `businessId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `packageId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `pricePaid` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionType` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `trialStartDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Subscription` table. All the data in the column will be lost.
  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `businessId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isSystemOwner` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Feature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackageByFeature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionByUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleByPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoleByUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLog` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `userId` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'admin', 'mentor', 'business');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('email', 'google', 'facebook', 'apple');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('not_started', 'in_progress', 'submitted', 'won', 'rejected');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trial', 'canceled', 'past_due');

-- CreateEnum
CREATE TYPE "ScholarshipDeadlineTimeline" AS ENUM ('SIX_PLUS_MONTHS', 'THREE_TO_SIX_MONTHS', 'ONE_TO_THREE_MONTHS', 'LESS_THAN_ONE_MONTH');

-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_packageId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PackageByFeature" DROP CONSTRAINT "PackageByFeature_featureId_fkey";

-- DropForeignKey
ALTER TABLE "PackageByFeature" DROP CONSTRAINT "PackageByFeature_packageId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionByUser" DROP CONSTRAINT "PermissionByUser_businessId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionByUser" DROP CONSTRAINT "PermissionByUser_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionByUser" DROP CONSTRAINT "PermissionByUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoleByPermission" DROP CONSTRAINT "RoleByPermission_businessId_fkey";

-- DropForeignKey
ALTER TABLE "RoleByPermission" DROP CONSTRAINT "RoleByPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RoleByPermission" DROP CONSTRAINT "RoleByPermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleByUser" DROP CONSTRAINT "RoleByUser_businessId_fkey";

-- DropForeignKey
ALTER TABLE "RoleByUser" DROP CONSTRAINT "RoleByUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleByUser" DROP CONSTRAINT "RoleByUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_packageId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_businessId_fkey";

-- DropForeignKey
ALTER TABLE "UserDetails" DROP CONSTRAINT "UserDetails_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLog" DROP CONSTRAINT "UserLog_businessId_fkey";

-- DropForeignKey
ALTER TABLE "UserLog" DROP CONSTRAINT "UserLog_userId_fkey";

-- DropIndex
DROP INDEX "Notification_businessId_idx";

-- DropIndex
DROP INDEX "Notification_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_status_idx";

-- DropIndex
DROP INDEX "Notification_type_idx";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- DropIndex
DROP INDEX "Subscription_businessId_idx";

-- DropIndex
DROP INDEX "Subscription_businessId_status_idx";

-- DropIndex
DROP INDEX "Subscription_endDate_idx";

-- DropIndex
DROP INDEX "Subscription_packageId_idx";

-- DropIndex
DROP INDEX "Subscription_startDate_idx";

-- DropIndex
DROP INDEX "Subscription_status_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_username_idx";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
DROP COLUMN "businessId",
DROP COLUMN "sentAt",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notification_id_seq";

-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
DROP COLUMN "businessId",
DROP COLUMN "deletedAt",
DROP COLUMN "endDate",
DROP COLUMN "packageId",
DROP COLUMN "pricePaid",
DROP COLUMN "startDate",
DROP COLUMN "subscriptionType",
DROP COLUMN "trialEndDate",
DROP COLUMN "trialStartDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subscription_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "businessId",
DROP COLUMN "deletedAt",
DROP COLUMN "isSystemOwner",
DROP COLUMN "password",
DROP COLUMN "status",
DROP COLUMN "username",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "oauthProvider" "OAuthProvider" NOT NULL DEFAULT 'email',
ADD COLUMN     "oauthProviderId" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'student',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Business";

-- DropTable
DROP TABLE "Feature";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "Package";

-- DropTable
DROP TABLE "PackageByFeature";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "PermissionByUser";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RoleByPermission";

-- DropTable
DROP TABLE "RoleByUser";

-- DropTable
DROP TABLE "UserDetails";

-- DropTable
DROP TABLE "UserLog";

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "bio" TEXT,
    "state" TEXT,
    "gpa" DOUBLE PRECISION,
    "financialNeed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentActivity" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "role" TEXT,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentWork" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentVolunteer" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "timeline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAward" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "awardName" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentChallenge" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "challengeType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentScholarshipInterest" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "interestTypes" JSONB NOT NULL,
    "deadlineTimeline" "ScholarshipDeadlineTimeline",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentScholarshipInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileProgress" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "progressPercent" INTEGER NOT NULL,
    "completedSections" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "awardAmount" INTEGER,
    "deadline" TIMESTAMP(3),

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'not_started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Essay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userProfileId" TEXT,
    "scholarshipId" TEXT,
    "title" TEXT NOT NULL,
    "prompt" TEXT,
    "contentDraft" TEXT,
    "contentFinal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "wordCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Essay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentScholarshipInterest_userProfileId_key" ON "StudentScholarshipInterest"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileProgress_userProfileId_key" ON "ProfileProgress"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_internalName_key" ON "Plan"("internalName");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWork" ADD CONSTRAINT "StudentWork_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVolunteer" ADD CONSTRAINT "StudentVolunteer_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAward" ADD CONSTRAINT "StudentAward_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChallenge" ADD CONSTRAINT "StudentChallenge_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScholarshipInterest" ADD CONSTRAINT "StudentScholarshipInterest_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileProgress" ADD CONSTRAINT "ProfileProgress_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
