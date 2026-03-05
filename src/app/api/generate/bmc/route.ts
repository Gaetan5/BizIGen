import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    // Call Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-1', // or latest
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Grok API error');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse JSON from response
    const bmcData = JSON.parse(generatedText);

    return NextResponse.json(bmcData);
  } catch (error) {
    console.error('Error generating BMC:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
