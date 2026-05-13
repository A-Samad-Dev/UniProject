/*
  Warnings:

  - The `qualification` column on the `applicants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `semester` on the `registrations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'graduated';

-- AlterTable
ALTER TABLE "applicants" DROP COLUMN "qualification",
ADD COLUMN     "qualification" "Qualification";

-- AlterTable
ALTER TABLE "registrations" DROP COLUMN "semester",
ADD COLUMN     "semester" "Semester" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "registrations_studentId_session_semester_key" ON "registrations"("studentId", "session", "semester");
