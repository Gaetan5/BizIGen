import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const prompt = `Tu es un assistant support pour Biz-IGen, une plateforme SaaS qui génère des Business Model Canvas, Lean Canvas et Business Plans avec IA pour entrepreneurs africains.

Contexte: ${context}

Question utilisateur: ${message}

Réponds de manière helpful, concise et en français. Si c'est une question technique, donne des conseils pratiques. Si c'est du support, guide vers les bonnes pratiques.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Grok API error');
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return NextResponse.json({ response: assistantResponse });
  } catch (error) {
    console.error('Error in support chat:', error);
    return NextResponse.json({
      response: 'Désolé, je rencontre un problème technique. Veuillez contacter support@bizigen.com'
    });
  }
}
