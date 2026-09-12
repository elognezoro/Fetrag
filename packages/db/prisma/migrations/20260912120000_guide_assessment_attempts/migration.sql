-- CreateTable
CREATE TABLE "GuideAssessmentAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideAssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuideAssessmentAttempt_userId_guideId_createdAt_idx" ON "GuideAssessmentAttempt"("userId", "guideId", "createdAt");

-- AddForeignKey
ALTER TABLE "GuideAssessmentAttempt" ADD CONSTRAINT "GuideAssessmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
