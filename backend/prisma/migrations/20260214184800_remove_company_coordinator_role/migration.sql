-- Remove COMPANY_COORDINATOR from UserRole enum

-- Drop defaults that reference the old enum type
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user_applications" ALTER COLUMN "role" DROP DEFAULT;

-- Rename the old enum
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

-- Create the new enum without COMPANY_COORDINATOR
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_SUPERVISOR', 'COMPANY_OPERATOR');

-- Update columns that use the enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING "role"::text::"UserRole";
ALTER TABLE "user_applications" ALTER COLUMN "role" TYPE "UserRole" USING "role"::text::"UserRole";

-- Re-add defaults
ALTER TABLE "user_applications" ALTER COLUMN "role" SET DEFAULT 'COMPANY_OPERATOR'::"UserRole";

-- Drop the old enum
DROP TYPE "UserRole_old";
