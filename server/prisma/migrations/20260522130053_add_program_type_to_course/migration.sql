-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('BSC', 'MSC', 'PHD', 'DIPLOMA');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "program" "ProgramType" NOT NULL DEFAULT 'BSC';
