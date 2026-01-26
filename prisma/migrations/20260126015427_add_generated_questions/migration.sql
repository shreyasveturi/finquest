-- CreateTable
CREATE TABLE "GeneratedQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "choicesJson" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER,
    "topicTag" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "questionId" TEXT,
    "generatedQuestionId" TEXT,
    "playerAAnswer" INTEGER,
    "playerBAnswer" INTEGER,
    "correctIndex" INTEGER NOT NULL,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchRound_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRound_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MatchRound_generatedQuestionId_fkey" FOREIGN KEY ("generatedQuestionId") REFERENCES "GeneratedQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MatchRound" ("correctIndex", "createdAt", "endedAt", "id", "matchId", "playerAAnswer", "playerBAnswer", "questionId", "roundIndex") SELECT "correctIndex", "createdAt", "endedAt", "id", "matchId", "playerAAnswer", "playerBAnswer", "questionId", "roundIndex" FROM "MatchRound";
DROP TABLE "MatchRound";
ALTER TABLE "new_MatchRound" RENAME TO "MatchRound";
CREATE UNIQUE INDEX "MatchRound_matchId_roundIndex_key" ON "MatchRound"("matchId", "roundIndex");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GeneratedQuestion_createdAt_idx" ON "GeneratedQuestion"("createdAt");
