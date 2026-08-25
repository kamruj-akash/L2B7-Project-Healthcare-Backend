/*
  Warnings:

  - You are about to drop the column `additionalFilesPublicIds` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `resumePublicId` on the `doctors` table. All the data in the column will be lost.
  - The `resume` column on the `doctors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `additionalFiles` column on the `doctors` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "additionalFilesPublicIds",
DROP COLUMN "resumePublicId",
DROP COLUMN "resume",
ADD COLUMN     "resume" JSONB,
DROP COLUMN "additionalFiles",
ADD COLUMN     "additionalFiles" JSONB[] DEFAULT ARRAY[]::JSONB[];
