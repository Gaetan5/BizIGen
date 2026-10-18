import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

interface ExportRequest {
  projectId: string;
  type: 'bmc' | 'lean' | 'bp';
  format: 'pdf' | 'png' | 'docx';
}

// POST /api/export - Export document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ExportRequest = await request.json();
    const { projectId, type, format } = body;

    // Get project with canvas data
    const project = await db.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id,
      },
      include: {
        generatedDoc: {
          include: {
            canvases: true,
          },
        },
      },
    });

    if (!project || !project.generatedDoc) {
      return NextResponse.json({ error: 'Projet non trouvé ou documents non générés' }, { status: 404 });
    }

    // Check subscription limits
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const limits = {
      FREE: { maxExports: 3, formats: ['png'] },
      BASIC: { maxExports: 20, formats: ['png', 'pdf'] },
      PRO: { maxExports: -1, formats: ['png', 'pdf', 'docx'] },
    };

    const userPlan = subscription?.plan || 'FREE';
    const planLimits = limits[userPlan as keyof typeof limits];

    // Check format availability
    if (!planLimits.formats.includes(format)) {
      return NextResponse.json(
        { error: `Format ${format.toUpperCase()} non disponible dans votre plan. Passez à un plan supérieur.` },
        { status: 403 }
      );
    }

    // Check export count
    if (planLimits.maxExports !== -1) {
      const exportsCount = await db.export.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });

      if (exportsCount >= planLimits.maxExports) {
        return NextResponse.json(
          { error: 'Limite d\'exports atteinte. Passez à un plan supérieur.' },
          { status: 403 }
        );
      }
    }

    // Get canvas data
    let canvasData: { blocks: string } | null | undefined = null;
    if (type === 'bmc') {
      canvasData = project.generatedDoc.canvases.find(c => c.canvasType === 'BUSINESS_MODEL_CANVAS');
    } else if (type === 'lean') {
      canvasData = project.generatedDoc.canvases.find(c => c.canvasType === 'LEAN_CANVAS');
    }
    
    // Get business plan data
    const rawContent = (project.generatedDoc as { rawContent?: string | null }).rawContent;
    const businessPlanData = rawContent ? JSON.parse(rawContent) : null;

    let exportId = '';
    let downloadUrl: string | null = null;
    const fileName = `${type === 'bmc' ? 'Business_Model_Canvas' : type === 'lean' ? 'Lean_Canvas' : 'Business_Plan'}_${project.name.replace(/\s+/g, '_')}.${format}`;

    // Tentative d'export via le backend Python ReportLab / python-docx pour PDF et DOCX
    if (format === 'pdf' || format === 'docx') {
      try {
        const backendBaseUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:3001';
        const internalApiKey = process.env.INTERNAL_API_KEY;

        if (internalApiKey) {
          const backendRes = await fetch(`${backendBaseUrl}/export`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-API-Key': internalApiKey,
              'X-User-Id': session.user.id,
            },
            body: JSON.stringify({
              projectId: project.id,
              type,
              format,
            }),
          });

          if (backendRes.ok) {
            const backendData = await backendRes.json();
            if (backendData.exportId) {
              exportId = backendData.exportId;
              downloadUrl = `/api/export/download/${exportId}?type=${type}&format=${format}`;
            }
          } else {
            console.warn('Backend export call failed, falling back to local export record:', await backendRes.text());
          }
        }
      } catch (err) {
        console.warn('Backend Python export unreachable, fallback to client-side:', err);
      }
    }

    // Si pas de backend Python ou si format PNG, enregistrement local Prisma
    if (!exportId) {
      const exportRecord = await db.export.create({
        data: {
          docId: project.generatedDoc.id,
          userId: session.user.id,
          format: format.toUpperCase() as 'PDF' | 'PNG' | 'DOCX',
          fileUrl: `/exports/${project.id}-${type}-${Date.now()}.${format}`,
          fileSize: 0,
        },
      });
      exportId = exportRecord.id;

      if (subscription) {
        await db.subscription.update({
          where: { userId: session.user.id },
          data: { exportsUsed: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({
      success: true,
      exportId,
      fileName,
      format,
      downloadUrl,
      canvasData: canvasData ? JSON.parse(canvasData.blocks) : null,
      businessPlanData,
      projectName: project.name,
      url: downloadUrl || `#export-${exportId}`,
      message: 'Export prêt. Le téléchargement va démarrer.',
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
