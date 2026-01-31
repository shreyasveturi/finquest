-- AlterTable
ALTER TABLE "GeneratedQuestion" ADD COLUMN     "structuralType" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "structuralType" TEXT;

-- CreateIndex
CREATE INDEX "GeneratedQuestion_structuralType_idx" ON "GeneratedQuestion"("structuralType");

-- CreateIndex
CREATE INDEX "Question_structuralType_idx" ON "Question"("structuralType");
