/**
 * Test script for Identity Lite discriminator uniqueness.
 * Creates 20 users with the same desired name and verifies all get unique discriminators.
 * 
 * Prerequisites:
 * - Run `npm install` to install dependencies
 * - Start dev server: `npm run dev`
 * - Run test: `npx tsx tests/identity-discriminator.test.ts`
 */

import { PrismaClient } from '@prisma/client';
import { canonicalizeUsername } from '../lib/identity';

const prisma = new PrismaClient();

async function testDiscriminatorUniqueness() {
  console.log('🧪 Testing Identity Lite discriminator uniqueness...\n');

  const testName = 'TestUser';
  const canonicalName = canonicalizeUsername(testName);
  const userCount = 20;
  const createdUsers: Array<{ clientId: string; discriminator: number }> = [];

  try {
    // Create 20 users with the same name
    console.log(`Creating ${userCount} users with name "${testName}"...`);
    
    for (let i = 0; i < userCount; i++) {
      const clientId = `test-${Date.now()}-${i}`;
      
      const response = await fetch('http://localhost:3000/api/identity/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          desiredName: testName,
        }),
      });

      const data = await response.json();
      
      if (!data.ok) {
        console.error(`❌ Failed to create user ${i + 1}:`, data.reason);
        continue;
      }

      createdUsers.push({
        clientId: data.user.clientId,
        discriminator: data.user.discriminator,
      });

      console.log(`✓ Created user ${i + 1}: ${data.user.tag}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Total users created: ${createdUsers.length}`);
    
    // Check for duplicate discriminators
    const discriminators = createdUsers.map(u => u.discriminator);
    const uniqueDiscriminators = new Set(discriminators);
    
    console.log(`- Unique discriminators: ${uniqueDiscriminators.size}`);
    console.log(`- Discriminators: [${Array.from(uniqueDiscriminators).sort((a, b) => a - b).join(', ')}]`);
    
    if (uniqueDiscriminators.size === createdUsers.length) {
      console.log('\n✅ SUCCESS: All discriminators are unique!');
    } else {
      console.log('\n❌ FAILURE: Found duplicate discriminators!');
      const duplicates = discriminators.filter((d, i) => discriminators.indexOf(d) !== i);
      console.log(`Duplicates: ${duplicates}`);
    }

    // Clean up test users
    console.log('\n🧹 Cleaning up test users...');
    await prisma.user.deleteMany({
      where: {
        clientId: {
          startsWith: 'test-',
        },
      },
    });
    console.log('✓ Test users deleted');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testDiscriminatorUniqueness()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { testDiscriminatorUniqueness };
