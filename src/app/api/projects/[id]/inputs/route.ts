import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// POST /api/projects/[id]/inputs - Save form inputs
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answers } = body as { answers: Record<string, string> };

    // Verify project ownership
    const project = await db.project.findFirst({
      where: { 
        id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Update project status to in_progress
    await db.project.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });

    // Delete existing inputs and create new ones
    await db.formInput.deleteMany({
      where: { projectId: id },
    });

    // Create new inputs
    const inputs = await Promise.all(
      Object.entries(answers).map(([key, value], index) =>
        db.formInput.create({
          data: {
            projectId: id,
            stepNumber: Math.floor(index / 4) + 1,
            questionKey: key,
            answerValue: value,
            answerType: 'TEXT',
          },
        })
      )
    );

    return NextResponse.json({ success: true, inputs });
  } catch (error) {
    console.error('Save inputs error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
