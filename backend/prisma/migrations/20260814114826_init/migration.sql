-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Scan"
  ADD COLUMN "riskScoreV2" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "criticalCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "highCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "mediumCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lowCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "dependencyId" TEXT NOT NULL,
    "advisoryId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "packageVersion" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "severity" "Severity" NOT NULL,
    "fixedVersion" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Finding_scanId_idx" ON "Finding"("scanId");

-- CreateIndex
CREATE INDEX "Finding_dependencyId_idx" ON "Finding"("dependencyId");

-- CreateIndex
CREATE INDEX "Finding_severity_idx" ON "Finding"("severity");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;