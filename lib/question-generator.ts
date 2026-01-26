import { z } from 'zod';

/**
 * Question generation service
 * Generates 5 unique, diverse multiple-choice questions via OpenAI
 * With fallback to seeded question bank if LLM fails
 */

const QuestionSchema = z.object({
  stem: z.string().min(20).max(500),
  choices: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  topicTag: z.string().optional(),
});

const GeneratedQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).length(5),
});

export interface GeneratedQuestion {
  stem: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: number;
  topicTag?: string;
}

interface GenerateOptions {
  difficulty?: number;
  recentStems?: string[];
  timeoutMs?: number;
}

/**
 * Generate 5 unique questions via OpenAI API
 * Includes anti-repetition and safety constraints
 */
export async function generateFiveQuestions(
  options: GenerateOptions = {}
): Promise<GeneratedQuestion[] | null> {
  const { difficulty = 3, recentStems = [], timeoutMs = 10000 } = options;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, will use fallback');
    return null;
  }

  // Anti-repetition: format recent stems into prompt
  const avoidStemsList = recentStems.slice(0, 10).join('\n- ');
  const avoidContext =
    recentStems.length > 0
      ? `\n\nAvoid these recent question stems:\n- ${avoidStemsList}`
      : '';

  const systemPrompt = `You are an expert question generator for a university-level reasoning competition.
Generate exactly 5 multiple-choice questions that are:
- Diverse in logic type (include deduction, probability, pattern recognition, fallacy detection, word logic)
- Meaningful and different from each other
- Appropriate for university students (no hate, harassment, explicit sexual content, self-harm, illegal activity, or real-person defamation)
- Difficulty around level ${difficulty}/5
- Focused on reasoning, logic, and critical thinking

Each question should have 4 choices, exactly one of which is correct.
Return ONLY valid JSON matching this exact format:
{
  "questions": [
    {
      "stem": "...",
      "choices": ["...", "...", "...", "..."],
      "correctIndex": 0,
      "explanation": "...",
      "difficulty": 3,
      "topicTag": "deduction"
    }
  ]
}`;

  const userPrompt = `Generate 5 new reasoning questions for a university-level competition.${avoidContext}

Format: Return ONLY the JSON object with exactly 5 questions. No markdown, no extra text.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      return null;
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content from OpenAI');
      return null;
    }

    // Parse JSON from response (may have markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content.slice(0, 200));
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = GeneratedQuestionsSchema.parse(parsed);

    // Validate no duplicates within batch
    const stems = validated.questions.map(q => q.stem.toLowerCase());
    const uniqueStems = new Set(stems);
    if (uniqueStems.size !== stems.length) {
      console.warn('Duplicate stems detected in generated batch, retrying...');
      return generateFiveQuestions({ ...options, timeoutMs });
    }

    return validated.questions;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('LLM generation timeout');
    } else {
      console.error('LLM generation error:', error);
    }
    return null;
  }
}

/**
 * Get recent stems for given clientId to avoid repetition
 * Returns last N generated question stems
 */
export async function getRecentStemsForClient(
  clientId: string,
  limit: number = 20
): Promise<string[]> {
  const { prisma } = await import('./prisma');

  const recentMatches = await prisma.match.findMany({
    where: {
      playerAId: clientId,
      isBotMatch: true,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
      },
    },
    select: {
      rounds: {
        select: {
          generatedQuestion: {
            select: { prompt: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const stems = recentMatches
    .flatMap(m => m.rounds)
    .filter(r => r.generatedQuestion?.prompt)
    .map(r => r.generatedQuestion!.prompt)
    .slice(0, limit);

  return stems;
}

/**
 * Local fallback generator: produces simple reasoning questions
 * Used when LLM is unavailable and seeded bank is insufficient
 */
export function generateLocalQuestions(count: number = 5): GeneratedQuestion[] {
  const out: GeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const a = 2 + Math.floor(Math.random() * 18); // 2..19
    const b = 2 + Math.floor(Math.random() * 18);
    const correct = a + b;
    const distractors = [correct + 1, correct - 1, correct + 2];
    const choices = [correct, ...distractors].map(n => String(n));
    // shuffle choices but keep correctIndex tracked
    const shuffled = [...choices].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(String(correct));
    out.push({
      stem: `If X=${a} and Y=${b}, what is X+Y?`,
      choices: shuffled,
      correctIndex,
      explanation: 'Add the two numbers.',
      difficulty: 2,
      topicTag: 'arithmetic',
    });
  }
  return out;
}
