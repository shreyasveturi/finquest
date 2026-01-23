import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  // EASY - Conclusion Follows (10)
  {
    type: 'conclusion-follows',
    prompt: 'All dogs are mammals. Rex is a dog. Does it follow that Rex is a mammal?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If it rains, the ground gets wet. The ground is wet. Does it follow that it rained?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1, // No - could be sprinkler
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'All birds can fly. Penguins are birds. Does it follow that penguins can fly?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1, // No - premise is false
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If temperature > 100°C, water boils. Temperature is 105°C. Does water boil?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'No cats are dogs. Some pets are cats. Does it follow that some pets are not dogs?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If you study, you pass. You passed. Does it follow that you studied?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1, // No - could pass without studying
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'All squares are rectangles. This shape is a square. Is it a rectangle?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If x > 5, then x > 3. x = 7. Is x > 3?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'No politicians are honest. Sam is honest. Is Sam a politician?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'conclusion-follows',
    prompt: 'All metals conduct electricity. Copper is a metal. Does copper conduct electricity?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'easy',
  },

  // EASY - Assumption Required (10)
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "This policy will reduce crime." Which assumption is required?',
    options: JSON.stringify([
      'Crime has been rising',
      'The policy targets crime causes',
      'Citizens support the policy',
    ]),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should hire Jane because she has 10 years of experience." What assumption?',
    options: JSON.stringify([
      'Jane wants the job',
      'Experience correlates with performance',
      'Jane has references',
    ]),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Eating carrots improves eyesight." Required assumption?',
    options: JSON.stringify([
      'Carrots contain nutrients for vision',
      'People like carrots',
      'Eyesight problems are common',
    ]),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should build more parks to improve health." What assumption?',
    options: JSON.stringify([
      'People will use the parks',
      'Parks are expensive',
      'Health is deteriorating',
    ]),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "This drug will cure the disease." Required assumption?',
    options: JSON.stringify([
      'The disease is widespread',
      'The drug targets the disease mechanism',
      'Patients can afford the drug',
    ]),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Lower taxes will boost the economy." What assumption?',
    options: JSON.stringify([
      'People will spend the tax savings',
      'Taxes are too high now',
      'The government has a surplus',
    ]),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should train employees to reduce errors." Required assumption?',
    options: JSON.stringify([
      'Errors are costly',
      'Lack of training causes errors',
      'Employees want training',
    ]),
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Banning plastic bags will help the environment." What assumption?',
    options: JSON.stringify([
      'Plastic bags harm the environment',
      'People support the ban',
      'Alternatives are available',
    ]),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Exercise improves mental health." Required assumption?',
    options: JSON.stringify([
      'Exercise affects brain chemistry',
      'Mental health is a priority',
      'People have time to exercise',
    ]),
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should invest in solar power because oil is running out." Assumption?',
    options: JSON.stringify([
      'Solar is cost-effective',
      'We need an alternative energy source',
      'Oil prices are high',
    ]),
    correctIndex: 1,
    difficulty: 'easy',
  },

  // MEDIUM - Conclusion Follows (13)
  {
    type: 'conclusion-follows',
    prompt: 'All successful startups have strong teams. Company X has a strong team. Is Company X successful?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine - affirming consequent
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If the stock market crashes, investors lose money. Investors are losing money. Did the market crash?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine - other reasons possible
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'Some doctors are scientists. All scientists value evidence. Do all doctors value evidence?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1, // No - only some doctors are scientists
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'Either A or B is true. A is false. Is B true?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If inflation rises, interest rates increase. Interest rates are not increasing. Is inflation rising?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1, // No - modus tollens
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'Most engineers are logical. Sam is logical. Is Sam an engineer?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If GDP grows, unemployment falls. GDP grew 3%. Did unemployment fall?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'No vegetarians eat meat. Some athletes are vegetarians. Do all athletes avoid meat?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If you exercise daily, you stay healthy. You are healthy. Do you exercise daily?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'All prime numbers >2 are odd. 17 is prime and >2. Is 17 odd?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If supply increases and demand stays constant, prices fall. Supply increased. Did prices fall?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Need to know if demand stayed constant
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'All valid arguments with true premises have true conclusions. This argument has a true conclusion. Is it valid with true premises?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If debt exceeds 100% of GDP, growth slows. Debt is 95% of GDP. Is growth slowing?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2,
    difficulty: 'medium',
  },

  // MEDIUM - Assumption Required (12)
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should adopt AI because competitors are adopting it." Required assumption?',
    options: JSON.stringify([
      'Competitors have better judgment',
      'Not adopting AI puts us at a disadvantage',
      'AI is affordable',
    ]),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Remote work increases productivity." What assumption is critical?',
    options: JSON.stringify([
      'Employees prefer remote work',
      'Distractions at home are manageable',
      'Technology supports remote collaboration',
    ]),
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Higher minimum wage will reduce poverty." Required assumption?',
    options: JSON.stringify([
      'Poverty is a problem',
      'Jobs won\'t be significantly lost',
      'Workers will spend the extra income',
    ]),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should regulate social media to protect privacy." What assumption?',
    options: JSON.stringify([
      'Current privacy protections are inadequate',
      'Users care about privacy',
      'Regulation is enforceable',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Electric vehicles will reduce emissions." Required assumption?',
    options: JSON.stringify([
      'Electricity generation is cleaner than gasoline',
      'EVs are affordable',
      'Charging infrastructure exists',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Diversifying investments reduces risk." What assumption?',
    options: JSON.stringify([
      'Assets are not perfectly correlated',
      'Investors want to reduce risk',
      'Markets are efficient',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should teach coding in schools to prepare students for jobs." Assumption?',
    options: JSON.stringify([
      'Future jobs will require coding skills',
      'Students are interested in coding',
      'Teachers can teach coding',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Raising interest rates will curb inflation." Required assumption?',
    options: JSON.stringify([
      'Higher rates reduce spending',
      'Inflation is demand-driven',
      'Central banks control rates',
    ]),
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Banning junk food ads will reduce obesity." What assumption?',
    options: JSON.stringify([
      'Ads influence food choices',
      'Obesity is a health crisis',
      'Healthy food is accessible',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should invest in quantum computing for national security." Assumption?',
    options: JSON.stringify([
      'Quantum computing has security applications',
      'Current security is insufficient',
      'We have the budget',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "Carbon taxes will reduce emissions." Required assumption?',
    options: JSON.stringify([
      'Higher costs change behavior',
      'Emissions cause climate change',
      'Alternatives to carbon exist',
    ]),
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Automation will displace workers." What assumption?',
    options: JSON.stringify([
      'Automation is cost-effective',
      'New jobs won\'t fully replace lost jobs',
      'Workers lack retraining options',
    ]),
    correctIndex: 1,
    difficulty: 'medium',
  },

  // HARD - Conclusion Follows (8)
  {
    type: 'conclusion-follows',
    prompt: 'If theory X is true, phenomenon Y occurs. Phenomenon Y occurs. Does this support theory X?',
    options: JSON.stringify(['Strongly supports', 'Weakly supports', 'Does not support']),
    correctIndex: 1, // Weakly - could be other theories
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'All observed swans are white. Does it follow that the next swan will be white?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1, // No - induction problem
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If a policy is efficient, it is not equitable. Policy P is efficient. Is it equitable?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'Correlation between X and Y is 0.8. Does X cause Y?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine - correlation ≠ causation
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If markets are efficient, prices reflect all information. Prices moved on news. Are markets efficient?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine - consistent but not proof
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'Either taxes rise or spending falls or debt increases. Taxes didn\'t rise and spending didn\'t fall. Did debt increase?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 0, // Yes - disjunctive syllogism
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'If innovation increases, productivity grows unless regulation increases. Innovation increased and regulation increased. Did productivity grow?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine - competing effects
    difficulty: 'hard',
  },
  {
    type: 'conclusion-follows',
    prompt: 'Most successful firms innovate. Firm Z innovates. Is Firm Z likely successful?',
    options: JSON.stringify(['Yes', 'No', 'Cannot determine']),
    correctIndex: 2, // Cannot determine - base rate needed
    difficulty: 'hard',
  },

  // HARD - Assumption Required (7)
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "We should prioritize GDP growth over environmental protection." Critical assumption?',
    options: JSON.stringify([
      'Environmental damage is reversible later',
      'GDP growth creates resources for future environmental fixes',
      'Growth and environment are mutually exclusive',
    ]),
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "Wealth inequality is justified if it results from fair competition." Required assumption?',
    options: JSON.stringify([
      'Current competition is fair',
      'Fairness is more important than equality',
      'Wealth reflects merit',
    ]),
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "We should act on expert consensus even with uncertainty." What assumption?',
    options: JSON.stringify([
      'Experts are more likely right than wrong',
      'Waiting for certainty is costlier than acting',
      'Consensus indicates truth',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Free markets allocate resources efficiently." Critical assumption?',
    options: JSON.stringify([
      'No externalities or information asymmetries',
      'Efficiency is the primary goal',
      'Markets are competitive',
    ]),
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    type: 'assumption-required',
    prompt: 'Argument: "We should tolerate speech we disagree with." Required assumption?',
    options: JSON.stringify([
      'Speech rarely causes direct harm',
      'Truth emerges from open debate',
      'Tolerance is a virtue',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    type: 'assumption-required',
    prompt: 'Claim: "AI alignment is solvable before superintelligence." What assumption?',
    options: JSON.stringify([
      'Progress in alignment will match progress in capability',
      'Superintelligence is far off',
      'Alignment is technically feasible',
    ]),
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    type: 'assumption-required',
    prompt: 'Conclusion: "Preventive war is justified if threat is credible." Critical assumption?',
    options: JSON.stringify([
      'Credibility assessment is reliable',
      'Preventive action reduces total harm',
      'Sovereignty can be overridden',
    ]),
    correctIndex: 1,
    difficulty: 'hard',
  },
];

async function main() {
  console.log('Seeding database...');

  // Clear existing questions
  await prisma.question.deleteMany({});

  // Insert questions
  for (const question of questions) {
    await prisma.question.create({
      data: question,
    });
  }

  console.log(`✅ Seeded ${questions.length} questions`);
  console.log(`   - Easy: ${questions.filter((q) => q.difficulty === 'easy').length}`);
  console.log(`   - Medium: ${questions.filter((q) => q.difficulty === 'medium').length}`);
  console.log(`   - Hard: ${questions.filter((q) => q.difficulty === 'hard').length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
