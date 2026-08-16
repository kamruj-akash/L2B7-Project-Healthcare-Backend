/*
  Warnings:

  - You are about to drop the column `profilePublicId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "profilePublicId",
ADD COLUMN     "imagePublicId" TEXT;
