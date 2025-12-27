const SYSTEM_PROMPT = `You are an experienced finance interview coach evaluating checkpoint answers for spring week/internship candidates.

Your task: Provide precise, constructive interview-style feedback on the user's answer.

Response format: ONLY output valid JSON matching this exact schema:
{
  "strengths": string[],        // 2-4 bullets of what was good
  "improvements": string[],      // 2-4 bullets of what could improve
  "missingLinks": string[],      // 2-4 bullets of macro/market linkages or implications they missed
  "betterAnswer": string,        // A concise, interview-ready rewrite (80-140 words)
  "scores": {
    "structure": number,         // 1-10
    "commercialAwareness": number, // 1-10
    "clarity": number,           // 1-10
    "specificity": number        // 1-10
  },
  "followUps": string[]          // 1-2 follow-up questions an interviewer might ask
}

Guidelines:
- Strengths: highlight specific good points (clarity, market linkages, structure)
- Improvements: be constructive, focus on interview readiness
- MissingLinks: emphasize macro connections, second-order effects, "why it matters"
- BetterAnswer: write as if you're the candidate in an interview - concise, structured, commercial. No fluff, no em-dashes. Start with a tight hook, 2-3 crisp points, end with implication.
- Scores: be honest but fair. 7-8 is good, 9-10 exceptional, 4-6 needs work, 1-3 weak.
- FollowUps: natural interview questions to probe deeper
- If user answer is empty/nonsense: note politely in improvements, still provide a model betterAnswer
- Never claim "correct/incorrect" - evaluate interview quality, reasoning, and clarity only`;

export async function POST(request: Request) {
  try {
    const { question, userAnswer, context, articleTitle } = await request.json();

    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'Missing question' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const userPrompt = `Interview Question: ${question}

${context ? `Context: ${context}` : ''}
${articleTitle ? `Article: ${articleTitle}` : ''}

Candidate's Answer:
${userAnswer || '(No answer provided)'}

Provide structured interview feedback in JSON format only.`;

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('OpenAI API error:', detail);
      return Response.json({ error: 'Upstream error', detail }, { status: 500 });
    }

    const data = await upstream.json();
    const responseText = data?.choices?.[0]?.message?.content?.trim();
    
    if (!responseText) {
      return Response.json({ error: 'No feedback returned' }, { status: 500 });
    }

    // Parse and validate JSON
    let feedback;
    try {
      feedback = JSON.parse(responseText);
      
      // Validate structure
      if (!feedback.strengths || !feedback.improvements || !feedback.missingLinks || 
          !feedback.betterAnswer || !feedback.scores || !feedback.followUps) {
        throw new Error('Invalid feedback structure');
      }
    } catch (parseError) {
      console.error('Failed to parse feedback JSON:', parseError, responseText);
      
      // Return fallback feedback
      return Response.json({
        strengths: ['You attempted the question'],
        improvements: [
          'Focus on the direct economic mechanisms',
          'Link your points to market or policy outcomes',
          'Use more specific language'
        ],
        missingLinks: [
          'Consider how this affects market confidence',
          'Think about second-order effects on the broader economy'
        ],
        betterAnswer: 'A strong answer would identify the key mechanism, explain why it matters for markets or policy, and note one implication. For example, it would connect the immediate impact to broader economic or commercial outcomes.',
        scores: {
          structure: 5,
          commercialAwareness: 5,
          clarity: 5,
          specificity: 5
        },
        followUps: [
          'How would this affect investor sentiment?',
          'What are the long-term implications?'
        ]
      }, { status: 200 });
    }

    return Response.json(feedback, { status: 200 });
  } catch (error) {
    console.error('Error in checkpoint-feedback endpoint:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
