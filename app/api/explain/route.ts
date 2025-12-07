const SYSTEM_PROMPT = `You are Scio, helping a finance candidate explain highlighted news text in interview terms.
- Be concise (80-140 words), structured, and clear.
- Cover: what it means, why it matters for markets/economy, and one interview-friendly talking point.
- Use plain English, no fluff.
- If the text is too short or unclear, ask for a clearer highlight.`;

export async function POST(request: Request) {
  try {
    const { text, articleTitle } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const prompt = `Article: ${articleTitle || 'Finance article'}\nHighlighted: ${text}\nExplain for an interview:`;

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
          { role: 'user', content: prompt },
        ],
        max_tokens: 220,
        temperature: 0.4,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return Response.json({ error: 'Upstream error', detail }, { status: 500 });
    }

    const data = await upstream.json();
    const explanation = data?.choices?.[0]?.message?.content?.trim();
    if (!explanation) {
      return Response.json({ error: 'No explanation returned' }, { status: 500 });
    }

    return Response.json({ explanation, model: 'gpt-4o-mini' }, { status: 200 });
  } catch (error) {
    console.error('Error in explain endpoint:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
