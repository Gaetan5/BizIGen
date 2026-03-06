import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// GET /api/projects - List all projects for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', session: null }, { status: 401 });
    }

    const userId = session.user.id;

    const projects = await db.project.findMany({
      where: { userId },
      include: {
        generatedDoc: {
          include: {
            canvases: true,
            exports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalDocs = projects.reduce((acc, p) => {
      if (p.generatedDoc) acc += p.generatedDoc.canvases.length + 1;
      return acc;
    }, 0);

    const exportsUsed = projects.reduce((acc, p) => {
      if (p.generatedDoc) acc += p.generatedDoc.exports.length;
      return acc;
    }, 0);

    return NextResponse.json({
      projects,
      totalDocs,
      exportsUsed,
    });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('POST /api/projects - Session:', session ? `User: ${session.user?.email}` : 'No session');
    
    if (!session?.user?.id) {
      console.log('POST /api/projects - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('POST /api/projects - Session user:', session.user.email);

    const userId = session.user.id;
    const body = await request.json();
    const { name, sector, country } = body;

    // Check subscription limits
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    const currentMonthProjects = await db.project.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const limits = {
      FREE: 1,
      BASIC: 5,
      PRO: -1,
    };

    const userPlan = subscription?.plan || 'FREE';
    const maxProjects = limits[userPlan as keyof typeof limits];

    if (maxProjects !== -1 && currentMonthProjects >= maxProjects) {
      return NextResponse.json(
        { error: 'Limite de projets atteinte. Veuillez mettre à niveau votre abonnement.' },
        { status: 403 }
      );
    }

    // Create project
    const project = await db.project.create({
      data: {
        userId,
        name: name || 'Nouveau projet',
        sector: sector || 'AUTRE',
        country: country || 'CM',
        status: 'DRAFT',
      },
    });

    // Update subscription usage
    if (subscription) {
      await db.subscription.update({
        where: { userId },
        data: { projectsUsed: { increment: 1 } },
      });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
