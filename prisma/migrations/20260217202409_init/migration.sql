-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'EVALUATION_FAILED');

-- CreateTable
CREATE TABLE "LearningGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptKey" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "LearningGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskPlan" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "difficultyLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAttempt" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "taskPlanId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskPlan_goalId_orderIndex_key" ON "TaskPlan"("goalId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAttempt_submissionId_key" ON "TaskAttempt"("submissionId");

-- AddForeignKey
ALTER TABLE "TaskPlan" ADD CONSTRAINT "TaskPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "LearningGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "LearningGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttempt" ADD CONSTRAINT "TaskAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttempt" ADD CONSTRAINT "TaskAttempt_taskPlanId_fkey" FOREIGN KEY ("taskPlanId") REFERENCES "TaskPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
