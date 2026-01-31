-- Phase 3: Engagement & Retention

-- Add fields to User table
ALTER TABLE "User" ADD COLUMN "cohortTag" TEXT;
ALTER TABLE "User" ADD COLUMN "isAnonymous" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "publicHandle" TEXT;
ALTER TABLE "User" ADD COLUMN "anonId" TEXT;

-- Add unique constraint and index
ALTER TABLE "User" ADD CONSTRAINT "User_anonId_key" UNIQUE ("anonId");
CREATE INDEX "User_cohortTag_idx" ON "User"("cohortTag");

-- Add fields to Match table
ALTER TABLE "Match" ADD COLUMN "scoreA" INTEGER;
ALTER TABLE "Match" ADD COLUMN "scoreB" INTEGER;
ALTER TABLE "Match" ADD COLUMN "decidedByRoundIndex" INTEGER;
ALTER TABLE "Match" ADD COLUMN "nearMiss" BOOLEAN NOT NULL DEFAULT false;

-- Add fields to Round table
ALTER TABLE "Round" ADD COLUMN "wasDecidingMistake" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Round" ADD COLUMN "efficiencyScore" DOUBLE PRECISION;

-- Create Season table
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- Create LeaderboardSnapshot table
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "efficiency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 1200,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Season_isActive_idx" ON "Season"("isActive");
CREATE INDEX "LeaderboardSnapshot_seasonId_rating_idx" ON "LeaderboardSnapshot"("seasonId", "rating");
CREATE UNIQUE INDEX "LeaderboardSnapshot_seasonId_userId_key" ON "LeaderboardSnapshot"("seasonId", "userId");

-- Add foreign keys
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
