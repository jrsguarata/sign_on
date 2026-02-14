-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'COMPANY_SUPERVISOR';

-- AlterTable
ALTER TABLE "user_applications" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'COMPANY_OPERATOR';
