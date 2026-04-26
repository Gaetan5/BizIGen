import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { message, projectId, context } = await request.json();

    let projectContext = '';
    if (projectId) {
      const project = await db.project.findFirst({
        where: { id: projectId, userId: session.user.id },
        include: { 
          formInputs: true,
          generatedDoc: {
            include: { canvases: true }
          }
        },
      });

      if (project) {
        projectContext = `
CONTEXTE PROJET ACTUEL:
- Nom: ${project.name}
- Secteur: ${project.sector}
- État: ${project.status}
- Données fournies: ${project.formInputs.map(i => `${i.questionKey}: ${i.answerValue}`).join(', ')}
`;
      }
    }

    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `Tu es un assistant expert en business plan et stratégie d'entreprise spécialisé dans le marché africain. 
          Ton but est d'aider l'entrepreneur à structurer son projet, répondre à ses doutes et l'aider à remplir son Business Model Canvas.
          Sois concret, pragmatique et encourageant. Utilise des exemples locaux si pertinent.` 
        },
        { 
          role: 'user', 
          content: `Message de l'utilisateur: ${message}\n${projectContext}${context ? `\nContexte additionnel: ${context}` : ''}` 
        }
      ],
      model: 'gpt-4o-mini',
    });

    const aiResponse = response.choices?.[0]?.message?.content || '';

    // Générer des suggestions automatiques basées sur la réponse
    const suggestionsResponse = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Génère 3 questions courtes que l\'utilisateur pourrait poser suite à ce message. Réponds uniquement avec un tableau JSON de chaînes de caractères.' },
        { role: 'user', content: aiResponse }
      ],
      model: 'gpt-4o-mini',
    });

    let suggestions = [];
    try {
      const suggestionsContent = suggestionsResponse.choices?.[0]?.message?.content || '[]';
      const jsonMatch = suggestionsContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Erreur parsing suggestions:', e);
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      suggestions,
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Erreur lors du traitement du message' }, { status: 500 });
  }
}
