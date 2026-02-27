-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "evaluation" JSONB,
ADD COLUMN     "passed" BOOLEAN;
