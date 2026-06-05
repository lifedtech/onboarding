-- AlterTable
ALTER TABLE "Healthmate" ADD COLUMN     "programApprovedMsg" TEXT,
ADD COLUMN     "programEndDate" TIMESTAMP(3),
ADD COLUMN     "programStartDate" TIMESTAMP(3),
ADD COLUMN     "programStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "programTitle" TEXT,
ADD COLUMN     "recallReminder" TIMESTAMP(3),
ADD COLUMN     "regDocName" TEXT,
ADD COLUMN     "regDocUrl" TEXT,
ADD COLUMN     "screeningQueries" TEXT,
ADD COLUMN     "screeningRemarks" TEXT;
