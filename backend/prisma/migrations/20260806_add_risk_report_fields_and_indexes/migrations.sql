CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
ALTER TABLE "RiskReport" ADD COLUMN "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW';
ALTER TABLE "RiskReport" ADD COLUMN "totalFindings" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RiskReport" ALTER COLUMN "riskLevel" DROP DEFAULT;
ALTER TABLE "RiskReport" ALTER COLUMN "totalFindings" DROP DEFAULT;
CREATE UNIQUE INDEX "RiskReport_scanId_key" ON "RiskReport"("scanId");
DROP INDEX "Scan_projectId_idx";
CREATE INDEX "Scan_projectId_status_idx" ON "Scan"("projectId", "status");