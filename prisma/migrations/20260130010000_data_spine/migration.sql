-- Phase -0.5: Data Spine & Instrumentation

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MatchStatus') THEN
    CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'ABANDONED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OpponentType') THEN
    CREATE TYPE "OpponentType" AS ENUM ('BOT', 'HUMAN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MatchResult') THEN
    CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW', 'UNKNOWN');
  END IF;
END $$;

-- Match table updates
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "opponentType" "OpponentType" NOT NULL DEFAULT 'BOT';
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "ratingBeforeA" INTEGER NOT NULL DEFAULT 1200;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "ratingAfterA" INTEGER;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "ratingBeforeB" INTEGER;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "ratingAfterB" INTEGER;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "resultA" "MatchResult" NOT NULL DEFAULT 'UNKNOWN';

-- Convert status to enum
ALTER TABLE "Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus"
USING (
  CASE "status"
    WHEN 'active' THEN 'ACTIVE'
    WHEN 'completed' THEN 'COMPLETED'
    WHEN 'abandoned' THEN 'ABANDONED'
    ELSE 'PENDING'
  END
)::"MatchStatus";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- Backfill opponentType for existing matches
UPDATE "Match"
SET "opponentType" = (CASE WHEN "isBotMatch" = true THEN 'BOT' ELSE 'HUMAN' END)::"OpponentType"
WHERE "opponentType" IS NULL;

-- Create Round logging table
CREATE TABLE IF NOT EXISTS "Round" (
  "id" TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL REFERENCES "Match"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "roundIndex" INTEGER NOT NULL,
  "questionId" TEXT,
  "correct" BOOLEAN NOT NULL,
  "selectedOption" TEXT,
  "timeExpired" BOOLEAN NOT NULL DEFAULT false,
  "responseTimeMs" INTEGER NOT NULL,
  "timeToFirstCommitMs" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Round_matchId_roundIndex_idx" ON "Round"("matchId", "roundIndex");
CREATE INDEX IF NOT EXISTS "Round_userId_createdAt_idx" ON "Round"("userId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Round_matchId_userId_roundIndex_key" ON "Round"("matchId", "userId", "roundIndex");
