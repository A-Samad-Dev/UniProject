-- AlterTable
ALTER TABLE "applicants" ADD COLUMN     "program" "ProgramType" NOT NULL DEFAULT 'BSC';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "program" "ProgramType";
