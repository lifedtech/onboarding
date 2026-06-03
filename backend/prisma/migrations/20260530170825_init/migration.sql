-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE');

-- CreateEnum
CREATE TYPE "HealthmateType" AS ENUM ('PRACTITIONER', 'CENTRE', 'ORGANIZER');

-- CreateTable
CREATE TABLE "OpsUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ops',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Healthmate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HealthmateType" NOT NULL,
    "category" TEXT NOT NULL,
    "phase" "Phase" NOT NULL DEFAULT 'PRE_QUALIFY',
    "daysInPhase" INTEGER NOT NULL DEFAULT 0,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opsUserId" TEXT NOT NULL,

    CONSTRAINT "Healthmate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "phase" "Phase" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "healthmateId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpsUser_email_key" ON "OpsUser"("email");

-- AddForeignKey
ALTER TABLE "Healthmate" ADD CONSTRAINT "Healthmate_opsUserId_fkey" FOREIGN KEY ("opsUserId") REFERENCES "OpsUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_healthmateId_fkey" FOREIGN KEY ("healthmateId") REFERENCES "Healthmate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
