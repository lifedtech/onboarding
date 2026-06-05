-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'VERIFIED', 'ESCALATED');

-- AlterTable
ALTER TABLE "Healthmate" ADD COLUMN     "registrationRemark" TEXT,
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING';
