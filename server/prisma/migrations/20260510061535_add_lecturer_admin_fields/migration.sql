/*
  Warnings:

  - You are about to drop the column `role` on the `applicants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "applicants" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "hireDate" TIMESTAMP(3),
ADD COLUMN     "permissions" TEXT[],
ADD COLUMN     "specialization" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");
