-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'ARTICLE', 'QUIZ');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResourceType" ADD VALUE 'VIDEO';
ALTER TYPE "ResourceType" ADD VALUE 'IMAGE';

-- DropIndex
DROP INDEX "lessons_moduleId_order_key";

-- DropIndex
DROP INDEX "modules_courseId_order_key";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "outcomes" TEXT[],
ADD COLUMN     "promoVideoUrl" TEXT,
ADD COLUMN     "requirements" TEXT[],
ADD COLUMN     "targetAudience" TEXT[],
ADD COLUMN     "totalDuration" INTEGER;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "LessonStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "type" "LessonType" NOT NULL DEFAULT 'VIDEO';

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "outcomes" TEXT[];

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "isDownloadable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
