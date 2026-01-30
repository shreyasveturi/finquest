-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_userId_fkey";

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
