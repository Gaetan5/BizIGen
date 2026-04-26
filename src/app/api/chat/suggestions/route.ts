import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let suggestions = [
      "Quelles informations dois-je fournir pour mon Business Model Canvas ?",
      "Comment bien définir ma proposition de valeur ?",
      "Quels sont les éléments clés d'un bon pitch ?"
    ];

    if (projectId) {
      const project = await db.project.findFirst({
        where: { id: projectId, userId: session.user.id },
      });

      if (project?.status === 'IN_PROGRESS') {
        suggestions = [
          "Comment valider mon hypothèse de marché ?",
          "Quelles métriques devrais-je suivre en priorité ?",
          "Comment identifier mes early adopters ?"
        ];
      } else if (project?.status === 'COMPLETED') {
        suggestions = [
          "Comment améliorer mon Business Model Canvas ?",
          "Quelles stratégies de croissance suggérez-vous ?",
          "Comment préparer mon pitch pour les investisseurs ?"
        ];
      }
    }

    return NextResponse.json({
      success: true,
      suggestions,
    });

  } catch (error: any) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des suggestions' }, { status: 500 });
  }
}
