-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "additionalFilesPublicIds" JSONB,
ADD COLUMN     "resumePublicId" TEXT,
ALTER COLUMN "qualification" DROP NOT NULL,
ALTER COLUMN "expYear" SET DEFAULT 0;
