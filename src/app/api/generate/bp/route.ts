import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    // Call Grok API with higher token limit for BP
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000, // Higher for BP
      }),
    });

    if (!response.ok) {
      throw new Error('Grok API error');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse JSON from response - BP has sections
    const bpData = JSON.parse(generatedText);

    return NextResponse.json(bpData);
  } catch (error) {
    console.error('Error generating BP:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
