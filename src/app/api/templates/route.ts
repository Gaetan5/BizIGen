import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    const type = searchParams.get('type'); // bmc, lean, bp

    const templates = await db.template.findMany({
      where: {
        isActive: true,
        ...(sector && { sector }),
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, sector, type, content, metadata } = body;

    const template = await db.template.create({
      data: {
        name,
        description,
        sector,
        type,
        content,
        metadata,
        isActive: true,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
      { status: 500 }
    );
  }
}

// GET /api/templates/[id] - Get single template
export async function GET_SINGLE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await db.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const template = await db.template.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    );
  }
}
