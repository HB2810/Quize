-- CreateEnum
CREATE TYPE "DisplayNameChoice" AS ENUM ('FIRST_NAME', 'INITIAL', 'ANONYMOUS');

-- AlterTable
ALTER TABLE "Recognition" ADD COLUMN     "displayChoice" "DisplayNameChoice",
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "selfiePath" TEXT;

-- CreateIndex
CREATE INDEX "Recognition_status_publishedAt_idx" ON "Recognition"("status", "publishedAt");
