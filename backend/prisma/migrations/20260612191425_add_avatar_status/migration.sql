-- AlterTable
ALTER TABLE "OpsUser" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "statusMode" TEXT NOT NULL DEFAULT 'online';
