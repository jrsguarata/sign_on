-- Mudar registros com status 'converted' para 'contacted'
UPDATE "contact_requests" SET "status" = 'contacted' WHERE "status" = 'converted';

-- Remover coluna converted_at
ALTER TABLE "contact_requests" DROP COLUMN IF EXISTS "converted_at";

-- Remover coluna priority
ALTER TABLE "contact_requests" DROP COLUMN IF EXISTS "priority";

-- Recriar enum ContactStatus sem 'converted'
ALTER TABLE "contact_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "ContactStatus" RENAME TO "ContactStatus_old";
CREATE TYPE "ContactStatus" AS ENUM ('pending', 'contacted', 'archived');
ALTER TABLE "contact_requests" ALTER COLUMN "status" TYPE "ContactStatus" USING "status"::text::"ContactStatus";
ALTER TABLE "contact_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::"ContactStatus";
DROP TYPE "ContactStatus_old";

-- Remover enum ContactPriority
DROP TYPE IF EXISTS "ContactPriority";
