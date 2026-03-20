import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// GET /api/share/[shareId] - Get shared document
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'shareId requis' }, { status: 400 });
    }

    const sharedDoc = await db.sharedDocument.findUnique({
      where: { shareId },
      include: {
        document: {
          include: {
            project: true,
            canvases: true,
          },
        },
      },
    });

    if (!sharedDoc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Check if expired
    if (sharedDoc.expiresAt && sharedDoc.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Lien expiré' }, { status: 410 });
    }

    // Check password if protected
    if (sharedDoc.isPasswordProtected) {
      return NextResponse.json({ 
        requiresPassword: true,
        documentName: sharedDoc.document.project.name,
      });
    }

    // Increment view count
    await db.sharedDocument.update({
      where: { shareId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      document: {
        projectName: sharedDoc.document.project.name,
        sector: sharedDoc.document.project.sector,
        country: sharedDoc.document.project.country,
        canvases: sharedDoc.document.canvases.map(c => ({
          type: c.canvasType,
          blocks: JSON.parse(c.blocks),
        })),
        businessPlan: sharedDoc.document.rawContent ? JSON.parse(sharedDoc.document.rawContent) : null,
      },
      shareSettings: {
        allowDownload: sharedDoc.allowDownload,
        expiresAt: sharedDoc.expiresAt,
      },
    });
  } catch (error) {
    console.error('Get shared document error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
}

// POST /api/share - Create share link
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      documentId, 
      expiresInDays = 7, 
      isPasswordProtected = false, 
      password,
      allowDownload = false 
    } = body;

    // Verify document ownership
    const doc = await db.generatedDocument.findFirst({
      where: { 
        id: documentId,
        project: { userId: session.user.id }
      },
      include: { project: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Generate unique share ID
    const shareId = randomBytes(16).toString('hex');
    
    // Hash password if provided
    let hashedPassword = null;
    if (isPasswordProtected && password) {
      const { hash } = await import('bcryptjs');
      hashedPassword = await hash(password, 10);
    }

    // Calculate expiration
    const expiresAt = expiresInDays > 0 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create share record
    const sharedDoc = await db.sharedDocument.create({
      data: {
        shareId,
        docId: documentId,
        expiresAt,
        isPasswordProtected,
        passwordHash: hashedPassword,
        allowDownload,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENT_SHARED',
        entityType: 'GeneratedDocument',
        entityId: documentId,
        metadata: JSON.stringify({ shareId, expiresInDays }),
      },
    });

    const shareUrl = `${process.env.NEXTAUTH_URL}/share/${shareId}`;

    return NextResponse.json({
      shareId,
      shareUrl,
      expiresAt,
      isPasswordProtected,
    });
  } catch (error) {
    console.error('Create share error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du lien de partage' },
      { status: 500 }
    );
  }
}

// POST /api/share/verify - Verify password for protected share
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, password } = body;

    const sharedDoc = await db.sharedDocument.findUnique({
      where: { shareId },
      include: {
        document: {
          include: {
            project: true,
            canvases: true,
          },
        },
      },
    });

    if (!sharedDoc || !sharedDoc.isPasswordProtected) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Verify password
    const { compare } = await import('bcryptjs');
    const isValid = await compare(password, sharedDoc.passwordHash || '');

    if (!isValid) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Increment view count
    await db.sharedDocument.update({
      where: { shareId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      document: {
        projectName: sharedDoc.document.project.name,
        sector: sharedDoc.document.project.sector,
        country: sharedDoc.document.project.country,
        canvases: sharedDoc.document.canvases.map(c => ({
          type: c.canvasType,
          blocks: JSON.parse(c.blocks),
        })),
        businessPlan: sharedDoc.document.rawContent ? JSON.parse(sharedDoc.document.rawContent) : null,
      },
      shareSettings: {
        allowDownload: sharedDoc.allowDownload,
        expiresAt: sharedDoc.expiresAt,
      },
    });
  } catch (error) {
    console.error('Verify share password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// DELETE /api/share - Delete share link
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'shareId requis' }, { status: 400 });
    }

    // Verify ownership
    const sharedDoc = await db.sharedDocument.findUnique({
      where: { shareId },
      include: {
        document: {
          include: { project: true },
        },
      },
    });

    if (!sharedDoc || sharedDoc.document.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Partage non trouvé' }, { status: 404 });
    }

    await db.sharedDocument.delete({
      where: { shareId },
    });

    return NextResponse.json({ success: true, message: 'Lien de partage supprimé' });
  } catch (error) {
    console.error('Delete share error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
