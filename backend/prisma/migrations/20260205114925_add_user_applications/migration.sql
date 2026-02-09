-- CreateTable
CREATE TABLE "user_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "user_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_applications_user_id_idx" ON "user_applications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_applications_user_id_application_id_key" ON "user_applications"("user_id", "application_id");

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
