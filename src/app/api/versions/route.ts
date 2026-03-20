import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

// GET /api/versions/[projectId] - Get all versions for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId requis' }, { status: 400 });
    }

    // Verify project ownership
    const project = await db.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Get all generated documents with their versions
    const documents = await db.generatedDocument.findMany({
      where: { projectId },
      include: {
        canvases: true,
        exports: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { version: 'desc' },
    });

    // Create version history
    const versions = documents.map(doc => ({
      id: doc.id,
      version: doc.version,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      hasBMC: doc.canvases.some(c => c.canvasType === 'BUSINESS_MODEL_CANVAS'),
      hasLean: doc.canvases.some(c => c.canvasType === 'LEAN_CANVAS'),
      hasBP: !!doc.rawContent,
    }));

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des versions' },
      { status: 500 }
    );
  }
}

// POST /api/versions/save - Save current state as new version
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, bmc, lean, bp } = body;

    // Verify project ownership
    const project = await db.project.findFirst({
      where: { id: projectId, userId: session.user.id },
      include: { generatedDoc: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    const currentVersion = project.generatedDoc?.version || 0;
    const newVersion = currentVersion + 1;

    // Create new document version
    const newDoc = await db.generatedDocument.create({
      data: {
        projectId,
        type: 'FULL',
        status: 'COMPLETED',
        version: newVersion,
        rawContent: bp ? JSON.stringify(bp) : null,
        canvases: {
          create: [
            ...(bmc ? [{
              canvasType: 'BUSINESS_MODEL_CANVAS',
              blocks: JSON.stringify(bmc),
            }] : []),
            ...(lean ? [{
              canvasType: 'LEAN_CANVAS',
              blocks: JSON.stringify(lean),
            }] : []),
          ],
        },
      },
      include: { canvases: true },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VERSION_SAVED',
        entityType: 'GeneratedDocument',
        entityId: newDoc.id,
        metadata: JSON.stringify({ version: newVersion }),
      },
    });

    return NextResponse.json({ 
      document: newDoc,
      message: `Version ${newVersion} sauvegardée`
    });
  } catch (error) {
    console.error('Save version error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la version' },
      { status: 500 }
    );
  }
}

// POST /api/versions/rollback - Rollback to specific version
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    // Get the document to rollback to
    const document = await db.generatedDocument.findFirst({
      where: { id: documentId },
      include: { project: true },
    });

    if (!document || document.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Update project to point to this version
    await db.project.update({
      where: { id: document.projectId },
      data: { updatedAt: new Date() },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VERSION_ROLLBACK',
        entityType: 'GeneratedDocument',
        entityId: documentId,
        metadata: JSON.stringify({ version: document.version }),
      },
    });

    return NextResponse.json({ 
      document,
      message: `Retour à la version ${document.version} effectué`
    });
  } catch (error) {
    console.error('Rollback error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du rollback' },
      { status: 500 }
    );
  }
}
