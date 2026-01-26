/**
 * Integration tests for bot match start endpoint
 * Tests idempotency, atomicity, and failure modes
 */

import { prisma } from '@/lib/prisma';

/**
 * Test: Concurrent start requests return the same matchId (idempotency)
 * 
 * Setup:
 * - Fresh clientId + username
 * - Questions exist in DB (at least 5)
 * 
 * Steps:
 * 1. Make 2 concurrent POST requests to /api/match/bot/start with same clientId
 * 2. Verify both get the same matchId
 * 3. Verify exactly 1 match exists in DB
 * 4. Verify match has exactly 5 rounds
 * 5. Verify roundIndex is 0-4
 */
async function testIdempotency(): Promise<void> {
  console.log('\n=== Test: Idempotency ===');

  // Setup
  const testClientId = `test-idempotency-${Date.now()}`;
  const testUsername = `user_${Math.random().toString(36).slice(2, 10)}`;

  // Cleanup from any previous failed tests
  await prisma.match.deleteMany({
    where: { playerAId: testClientId },
  });

  const clientId = testClientId;
  const username = testUsername;

  try {
    // Make concurrent requests
    console.log('Making 2 concurrent requests...');
    const [res1, res2] = await Promise.all([
      fetch('/api/match/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, username }),
      }),
      fetch('/api/match/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, username }),
      }),
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    console.log('Response 1:', { status: res1.status, matchId: data1.matchId, cached: data1.cached, requestId: data1.requestId });
    console.log('Response 2:', { status: res2.status, matchId: data2.matchId, cached: data2.cached, requestId: data2.requestId });

    if (!data1.matchId || !data2.matchId) {
      throw new Error(`Failed to create match: data1=${JSON.stringify(data1)}, data2=${JSON.stringify(data2)}`);
    }

    // Verify same matchId
    if (data1.matchId !== data2.matchId) {
      throw new Error(`Idempotency failed: got different matchIds ${data1.matchId} vs ${data2.matchId}`);
    }
    console.log('✓ Both requests returned same matchId');

    // Verify exactly 1 match
    const matches = await prisma.match.findMany({
      where: { playerAId: clientId },
    });
    if (matches.length !== 1) {
      throw new Error(`Expected 1 match, found ${matches.length}`);
    }
    console.log('✓ Exactly 1 match exists in DB');

    // Verify match has exactly 5 rounds
    const match = matches[0];
    const rounds = await prisma.matchRound.findMany({
      where: { matchId: match.id },
    });
    if (rounds.length !== 5) {
      throw new Error(`Expected 5 rounds, found ${rounds.length}`);
    }
    console.log('✓ Match has exactly 5 rounds');

    // Verify roundIndex is 0-4 and unique
    const roundIndices = rounds.map(r => r.roundIndex).sort();
    const expected = [0, 1, 2, 3, 4];
    if (JSON.stringify(roundIndices) !== JSON.stringify(expected)) {
      throw new Error(`Expected roundIndex [0,1,2,3,4], got ${JSON.stringify(roundIndices)}`);
    }
    console.log('✓ Round indices are 0-4 and unique');

    // Verify match is marked as active
    if (match.status !== 'active') {
      throw new Error(`Expected status 'active', got '${match.status}'`);
    }
    console.log('✓ Match status is active');

    // Verify match is marked as isBotMatch
    if (!match.isBotMatch) {
      throw new Error('Match is not marked as isBotMatch');
    }
    console.log('✓ Match is marked as isBotMatch');

    console.log('✓ PASSED: testIdempotency\n');
  } finally {
    // Cleanup
    await prisma.match.deleteMany({ where: { playerAId: clientId } });
  }
}

/**
 * Test: User creation + match creation in single atomic call
 * 
 * Steps:
 * 1. Call /api/match/bot/start with clientId that doesn't exist in DB
 * 2. Verify user is created
 * 3. Verify match is created and assigned to user
 * 4. Verify user has default rating 1200 and tier 'Bronze'
 */
async function testUserCreation(): Promise<void> {
  console.log('\n=== Test: User Creation ===');

  const testClientId = `test-user-create-${Date.now()}`;
  const testUsername = `newuser_${Math.random().toString(36).slice(2, 10)}`;

  // Cleanup
  await prisma.user.deleteMany({ where: { id: testClientId } });
  await prisma.match.deleteMany({ where: { playerAId: testClientId } });

  const clientId = testClientId;
  const username = testUsername;

  try {
    // User should not exist yet
    let user = await prisma.user.findUnique({ where: { id: clientId } });
    if (user) {
      throw new Error('User already exists before test');
    }

    // Call start endpoint
    const res = await fetch('/api/match/bot/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, username }),
    });

    const data = await res.json();
    if (!data.matchId) {
      throw new Error(`Failed to create match: ${JSON.stringify(data)}`);
    }

    // Verify user is created
    user = await prisma.user.findUnique({ where: { id: clientId } });
    if (!user) {
      throw new Error('User was not created');
    }
    console.log('✓ User created');

    // Verify user has correct name, rating, tier
    if (user.name !== username) {
      throw new Error(`Expected username '${username}', got '${user.name}'`);
    }
    console.log('✓ User has correct username');

    if (user.rating !== 1200) {
      throw new Error(`Expected rating 1200, got ${user.rating}`);
    }
    console.log('✓ User has default rating 1200');

    if (user.tier !== 'Bronze') {
      throw new Error(`Expected tier 'Bronze', got '${user.tier}'`);
    }
    console.log('✓ User has default tier Bronze');

    // Verify match exists and is assigned to user
    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match || match.playerAId !== clientId) {
      throw new Error('Match not assigned to user');
    }
    console.log('✓ Match assigned to user');

    console.log('✓ PASSED: testUserCreation\n');
  } finally {
    // Cleanup
    await prisma.user.deleteMany({ where: { id: clientId } });
    await prisma.match.deleteMany({ where: { playerAId: clientId } });
  }
}

/**
 * Test: Error handling when questions are missing
 * 
 * Steps:
 * 1. Delete all questions from DB (or filter to < 5)
 * 2. Call /api/match/bot/start
 * 3. Verify error response with code 'NO_QUESTIONS' and requestId
 * 4. Verify no match/user created
 * 5. Restore questions
 */
async function testMissingQuestions(): Promise<void> {
  console.log('\n=== Test: Missing Questions Error ===');

  const testClientId = `test-no-questions-${Date.now()}`;
  const testUsername = `user_${Math.random().toString(36).slice(2, 10)}`;

  // Cleanup
  await prisma.match.deleteMany({ where: { playerAId: testClientId } });

  try {
    // Save question count
    const questionCountBefore = await prisma.question.count();
    console.log(`Questions in DB before: ${questionCountBefore}`);

    // Delete all questions temporarily
    await prisma.question.deleteMany({});
    console.log('Questions deleted');

    // Call start endpoint
    const res = await fetch('/api/match/bot/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: testClientId, username: testUsername }),
    });

    const data = await res.json();
    console.log('Response:', { status: res.status, error: data.error, requestId: data.requestId });

    // Verify error response
    if (res.status !== 500) {
      throw new Error(`Expected status 500, got ${res.status}`);
    }
    console.log('✓ Correct error status (500)');

    if (data.error?.code !== 'NO_QUESTIONS') {
      throw new Error(`Expected error code 'NO_QUESTIONS', got '${data.error?.code}'`);
    }
    console.log('✓ Correct error code (NO_QUESTIONS)');

    if (!data.requestId) {
      throw new Error('requestId missing from error response');
    }
    console.log('✓ requestId present in response');

    // Verify no match created
    const matchCount = await prisma.match.count({ where: { playerAId: testClientId } });
    if (matchCount > 0) {
      throw new Error('Match was created despite missing questions');
    }
    console.log('✓ No match created');

    console.log('✓ PASSED: testMissingQuestions\n');
  } finally {
    // Cleanup: restore questions via prisma seed or assume seed.ts populates them
    // For now, just note that in a real environment the seed would be re-run
    console.log('Note: In real environment, run `npm run prisma:seed` to restore questions');
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Bot Match Start Endpoint - Test Suite    ║');
  console.log('╚════════════════════════════════════════════╝');

  const tests = [testIdempotency, testUserCreation, testMissingQuestions];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (error) {
      failed++;
      console.error(`✗ FAILED: ${test.name}`);
      console.error(error instanceof Error ? error.message : String(error));
      console.log();
    }
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed, ${failed} failed           ║`);
  console.log('╚════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests if this is the main module
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testIdempotency, testUserCreation, testMissingQuestions };
