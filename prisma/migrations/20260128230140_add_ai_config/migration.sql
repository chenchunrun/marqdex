-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiApiEndpoint" TEXT,
ADD COLUMN     "aiModel" TEXT DEFAULT 'gpt-3.5-turbo';
