/*
  Warnings:

  - Made the column `imageUrl` on table `Recipe` required. This step will fail if there are existing NULL values in that column.

*/

-- Delete recipes without images
DELETE FROM "Recipe" WHERE "imageUrl" IS NULL;

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "imageUrl" SET NOT NULL;
