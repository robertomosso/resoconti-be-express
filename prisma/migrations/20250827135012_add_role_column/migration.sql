-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superuser', 'admin', 'user');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
