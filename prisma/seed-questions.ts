import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_QUESTIONS = [
  {
    type: 'deduction',
    prompt: 'All mammals are animals. All dogs are mammals. Therefore, all dogs are:',
    options: JSON.stringify(['plants', 'animals', 'insects', 'reptiles']),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'logic',
    prompt: 'If all roses are flowers and some flowers fade quickly, which statement must be true?',
    options: JSON.stringify([
      'All roses fade quickly',
      'Some roses fade quickly',
      'No roses fade quickly',
      'Flowers are always red',
    ]),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'reasoning',
    prompt: 'In a race, Alice finished before Bob. Bob finished before Carol. Who finished first?',
    options: JSON.stringify(['Alice', 'Bob', 'Carol', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'logic',
    prompt: 'If P is true and Q is false, what is the truth value of (P AND Q)?',
    options: JSON.stringify(['True', 'False', 'Unknown', 'Both true and false']),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'reasoning',
    prompt: 'Every bird can fly. Penguins are birds. Therefore, penguins can fly. Is this reasoning valid?',
    options: JSON.stringify([
      'Yes, the logic is valid',
      'No, penguins cannot fly',
      'Valid logic but false premise',
      'Cannot be determined',
    ]),
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    type: 'pattern',
    prompt: 'What number comes next in this sequence? 2, 4, 8, 16, ?',
    options: JSON.stringify(['20', '24', '32', '64']),
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    type: 'logic',
    prompt: 'If no reptiles are mammals and all snakes are reptiles, then snakes are:',
    options: JSON.stringify(['mammals', 'not mammals', 'sometimes mammals', 'depends on the snake']),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'reasoning',
    prompt: 'All A are B. All C are B. What can we conclude about the relationship between A and C?',
    options: JSON.stringify([
      'All A are C',
      'All C are A',
      'Some A are C',
      'Cannot determine the relationship',
    ]),
    correctIndex: 3,
    difficulty: 'hard',
  },
  {
    type: 'logic',
    prompt: 'If it rains, the ground is wet. The ground is not wet. What can we conclude?',
    options: JSON.stringify([
      'It rained',
      'It did not rain',
      'It might rain later',
      'The ground is dry',
    ]),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'pattern',
    prompt: 'Complete the pattern: A, B, C, D, E, ?',
    options: JSON.stringify(['E', 'F', 'G', 'H']),
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    type: 'reasoning',
    prompt: 'If some cats are black and all black things are visible in the dark, what can we say about some cats?',
    options: JSON.stringify([
      'All cats are visible in the dark',
      'Some cats are visible in the dark',
      'No cats are visible in the dark',
      'We cannot determine this',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'logic',
    prompt: 'Which statement is logically equivalent to "If P then Q"?',
    options: JSON.stringify([
      'If not P then not Q',
      'If not Q then not P',
      'If Q then P',
      'Q only if P',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'reasoning',
    prompt: 'All squares are rectangles. All rectangles are quadrilaterals. What type of shape is a square?',
    options: JSON.stringify(['Only a square', 'A rectangle and a quadrilateral', 'A quadrilateral only', 'None of the above']),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'logic',
    prompt: 'In a group, 30% play tennis and 40% play basketball. What percentage play both?',
    options: JSON.stringify([
      '10% (minimum)',
      '70% (exact)',
      'Cannot be determined',
      '0% (they are separate groups)',
    ]),
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    type: 'pattern',
    prompt: 'What is the next number? 1, 1, 2, 3, 5, 8, ?',
    options: JSON.stringify(['11', '12', '13', '14']),
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    type: 'deduction',
    prompt: 'All flowers need water. Roses are flowers. Do roses need water?',
    options: JSON.stringify(['Yes', 'No', 'Sometimes', 'Only in summer']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'logic',
    prompt: 'If John is taller than Mary and Mary is taller than Susan, then:',
    options: JSON.stringify([
      'Susan is taller than John',
      'John is taller than Susan',
      'They are all the same height',
      'Cannot be determined',
    ]),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'reasoning',
    prompt: 'Some students study hard. Some hard workers succeed. Can we conclude some students succeed?',
    options: JSON.stringify([
      'Yes, definitely',
      'No, not necessarily',
      'Only if they study the right subjects',
      'Yes, all of them',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'logic',
    prompt: 'What is the contrapositive of "If it snows, then it is cold"?',
    options: JSON.stringify([
      'If it is cold, then it snows',
      'If it is not cold, then it does not snow',
      'If it does not snow, then it is not cold',
      'Snow causes cold temperatures',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'pattern',
    prompt: 'Complete: Monday, Wednesday, Friday, ?',
    options: JSON.stringify(['Saturday', 'Sunday', 'Tuesday', 'Thursday']),
    correctIndex: 1,
    difficulty: 'easy',
  },
];

async function main() {
  console.log('Seeding questions...');

  for (const q of SAMPLE_QUESTIONS) {
    await prisma.question.create({
      data: q,
    });
  }

  console.log(`✓ Seeded ${SAMPLE_QUESTIONS.length} questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
