/**
 * Interview Explain API Endpoint
 * 
 * Takes highlighted text and returns an interview-focused explanation.
 * Currently returns template responses. Ready for AI integration.
 * 
 * POST /api/explain
 * Body: { text: string, articleId: string }
 * Response: { explanation: string, talkingPoints: string[] }
 */

export async function POST(request: Request) {
  try {
    const { text, articleId } = await request.json();

    if (!text || !articleId) {
      return Response.json(
        { error: 'Missing required fields: text, articleId' },
        { status: 400 }
      );
    }

    // Template response - ready for AI integration
    const explanation = `When explaining "${text}" in an interview context, focus on:
    
1. Why this matters to financial decision-making
2. Real-world examples and applications
3. How it connects to broader economic trends
4. Potential risks and opportunities

This will show you understand not just the definition, but the practical implications.`;

    const talkingPoints = [
      'This concept affects investment decisions',
      'It influences market confidence and behavior',
      'Understanding it is essential for financial literacy',
      'It demonstrates knowledge of current events',
    ];

    return Response.json(
      { explanation, talkingPoints, model: 'placeholder' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in explain endpoint:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
