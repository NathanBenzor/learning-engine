/*
  Warnings:

  - You are about to drop the column `completedAt` on the `LearningGoal` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `LearningGoal` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `submissionId` on the `TaskAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `taskPlanId` on the `TaskAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `TaskPlan` table. All the data in the column will be lost.
  - You are about to drop the column `difficultyLevel` on the `TaskPlan` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `TaskPlan` table. All the data in the column will be lost.
  - Added the required column `taskPlanId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `TaskAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `TaskPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TaskAttempt" DROP CONSTRAINT "TaskAttempt_taskPlanId_fkey";

-- DropIndex
DROP INDEX "TaskAttempt_submissionId_key";

-- DropIndex
DROP INDEX "TaskPlan_goalId_orderIndex_key";

-- AlterTable
ALTER TABLE "LearningGoal" DROP COLUMN "completedAt",
DROP COLUMN "difficulty";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "taskPlanId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaskAttempt" DROP COLUMN "submissionId",
DROP COLUMN "taskPlanId",
ADD COLUMN     "taskId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaskPlan" DROP COLUMN "content",
DROP COLUMN "difficultyLevel",
DROP COLUMN "orderIndex",
ADD COLUMN     "difficulty" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "taskPlanId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Task_taskPlanId_orderIndex_key" ON "Task"("taskPlanId", "orderIndex");

-- AddForeignKey
ALTER TABLE "LearningGoal" ADD CONSTRAINT "LearningGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskPlanId_fkey" FOREIGN KEY ("taskPlanId") REFERENCES "TaskPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_taskPlanId_fkey" FOREIGN KEY ("taskPlanId") REFERENCES "TaskPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttempt" ADD CONSTRAINT "TaskAttempt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
