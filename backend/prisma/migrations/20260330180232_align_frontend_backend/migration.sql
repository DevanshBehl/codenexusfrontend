/*
  Warnings:

  - You are about to drop the column `url` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "timeLimitMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "url",
ADD COLUMN     "githubLink" TEXT,
ADD COLUMN     "liveLink" TEXT,
ALTER COLUMN "techStack" SET NOT NULL,
ALTER COLUMN "techStack" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "codeNexusId" TEXT,
ADD COLUMN     "otherInfo" TEXT,
ADD COLUMN     "parentContactNo" TEXT,
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentsName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "xPercentage" TEXT,
ADD COLUMN     "xSchool" TEXT,
ADD COLUMN     "xiiPercentage" TEXT,
ADD COLUMN     "xiiSchool" TEXT;
