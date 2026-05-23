-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'null');

-- AlterTable
ALTER TABLE "applicants" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'null';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'null';
