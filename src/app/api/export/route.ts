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

    // Generate export record
    const exportRecord = await db.export.create({
      data: {
        docId: project.generatedDoc.id,
        userId: session.user.id,
        format: format.toUpperCase() as 'PDF' | 'PNG' | 'DOCX',
        fileUrl: `/exports/${project.id}-${type}-${Date.now()}.${format}`,
        fileSize: 0,
      },
    });

    // Update subscription usage
    if (subscription) {
      await db.subscription.update({
        where: { userId: session.user.id },
        data: { exportsUsed: { increment: 1 } },
      });
    }

    // For demo purposes, return a mock URL
    // In production, you would generate the actual file
    const fileName = `${type === 'bmc' ? 'Business_Model_Canvas' : type === 'lean' ? 'Lean_Canvas' : 'Business_Plan'}_${project.name.replace(/\s+/g, '_')}.${format}`;
    
    // Return export info with canvas data for client-side generation
    return NextResponse.json({
      success: true,
      exportId: exportRecord.id,
      fileName,
      format,
      canvasData: canvasData ? JSON.parse(canvasData.blocks) : null,
      businessPlanData,
      projectName: project.name,
      // In production, this would be a real file URL
      url: `#export-${exportRecord.id}`,
      message: 'Export ready. Download will start automatically.',
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
