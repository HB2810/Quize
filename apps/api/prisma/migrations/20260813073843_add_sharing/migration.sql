-- AlterTable
ALTER TABLE "JourneyVersion" ADD COLUMN     "shareConfig" JSONB;

-- CreateTable
CREATE TABLE "ShareResult" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "journeyVersionId" TEXT NOT NULL,
    "journeySlug" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareResult_publicId_key" ON "ShareResult"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareResult_sessionId_key" ON "ShareResult"("sessionId");

-- CreateIndex
CREATE INDEX "ShareResult_journeySlug_idx" ON "ShareResult"("journeySlug");

-- AddForeignKey
ALTER TABLE "ShareResult" ADD CONSTRAINT "ShareResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
