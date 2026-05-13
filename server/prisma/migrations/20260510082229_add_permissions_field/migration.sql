/*
  Warnings:

  - The `permissions` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('create_user', 'edit_user', 'delete_user', 'view_users', 'create_course', 'edit_course', 'delete_course', 'view_courses', 'upload_results', 'approve_results', 'view_results', 'manage_departments', 'manage_faculties', 'view_logs', 'system_settings', 'all');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'super_admin';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "permissions",
ADD COLUMN     "permissions" "Permission"[];
