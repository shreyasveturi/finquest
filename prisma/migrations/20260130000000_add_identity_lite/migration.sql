-- AlterTable: Add Identity Lite fields to User model
-- Phase -1: Identity Lite implementation

-- First, add nullable columns to existing User table
ALTER TABLE "User" ADD COLUMN "clientId" TEXT;
ALTER TABLE "User" ADD COLUMN "displayName" TEXT;
ALTER TABLE "User" ADD COLUMN "canonicalName" TEXT;
ALTER TABLE "User" ADD COLUMN "discriminator" INTEGER;
ALTER TABLE "User" ADD COLUMN "lastNameChangeAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "banned" BOOLEAN DEFAULT false;

-- For existing users, populate with defaults based on their current data
-- This handles legacy users who existed before the identity system
UPDATE "User" 
SET 
  "clientId" = 'legacy-' || "id",
  "displayName" = COALESCE("name", "email", 'Player'),
  "canonicalName" = LOWER(TRIM(COALESCE("name", "email", 'player'))),
  "discriminator" = (RANDOM() * 9999)::INTEGER,
  "banned" = false
WHERE "clientId" IS NULL;

-- Now make the required columns NOT NULL
ALTER TABLE "User" ALTER COLUMN "clientId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "displayName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "canonicalName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "discriminator" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "banned" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "banned" SET DEFAULT false;

-- Create unique constraint on clientId
CREATE UNIQUE INDEX "User_clientId_key" ON "User"("clientId");

-- Create compound unique constraint on canonicalName + discriminator
CREATE UNIQUE INDEX "User_canonicalName_discriminator_key" ON "User"("canonicalName", "discriminator");

-- Create index on canonicalName for faster lookups
CREATE INDEX "User_canonicalName_idx" ON "User"("canonicalName");
