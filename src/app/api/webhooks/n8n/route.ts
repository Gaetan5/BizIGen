import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    // 1. Liste des clés secrètes autorisées (environnement ou jeton d'intégration dédié)
    const DEDICATED_N8N_KEY = '4c0e4bb8721c10134794ea44382208aadd2570eb7a5560918628064fb4f1d115';
    const authorizedSecrets = [
      process.env.N8N_WEBHOOK_SECRET,
      process.env.INTERNAL_API_KEY,
      DEDICATED_N8N_KEY,
    ].filter((s): s is string => Boolean(s && s.length >= 16));

    const signature = request.headers.get('x-bizgen-signature');
    const internalKey = request.headers.get('x-internal-api-key') || request.headers.get('x-bizgen-secret');

    let isAuthorized = false;

    // Vérification par clé interne directe
    if (internalKey && authorizedSecrets.includes(internalKey)) {
      isAuthorized = true;
    }

    // Vérification par signature HMAC-SHA256
    if (!isAuthorized && signature) {
      for (const secret of authorizedSecrets) {
        const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        const sigBuf = Buffer.from(signature);
        const compBuf = Buffer.from(computed);
        if (sigBuf.length === compBuf.length && crypto.timingSafeEqual(sigBuf, compBuf)) {
          isAuthorized = true;
          break;
        }
      }
    }

    // En environnement de dev si pas de secret explicite, autoriser pour faciliter les tests
    if (!isAuthorized && authorizedSecrets.length === 0 && process.env.NODE_ENV === 'development') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Signature invalide ou clé non autorisée' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { action, projectId, data } = payload;

    if (!projectId) {
      return NextResponse.json({ error: 'Le champ projectId est requis' }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { generatedDoc: { include: { canvases: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    // 2. Traitement des actions d'enrichissement n8n
    if (action === 'ENRICH_MARKET_INTELLIGENCE') {
      // Enrichir le Business Plan / Document généré avec des données marché vérifiées
      if (project.generatedDoc) {
        let currentRaw: Record<string, unknown> = {};
        try {
          if (project.generatedDoc.rawContent) {
            currentRaw = JSON.parse(project.generatedDoc.rawContent);
          }
        } catch {
          currentRaw = {};
        }

        const updatedRaw = {
          ...currentRaw,
          marketIntelligence: {
            enrichedAt: new Date().toISOString(),
            source: 'Boukarou OS Cognitive Hub (n8n)',
            verifiedCompetitors: data.verifiedCompetitors || [],
            pricingBenchmarks: data.pricingBenchmarks || [],
            regulatoryCheck: data.regulatoryCheck || null,
            fundingOpportunities: data.fundingOpportunities || [],
            insights: data.insights || [],
          },
        };

        await db.generatedDocument.update({
          where: { id: project.generatedDoc.id },
          data: {
            rawContent: JSON.stringify(updatedRaw),
            updatedAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Intelligence de marché injectée avec succès dans le projet',
      });
    }

    if (action === 'MENTOR_REVIEW') {
      // Injection de la revue et certification d'un mentor Boukarou OS
      if (project.generatedDoc) {
        let currentRaw: Record<string, unknown> = {};
        try {
          if (project.generatedDoc.rawContent) {
            currentRaw = JSON.parse(project.generatedDoc.rawContent);
          }
        } catch {
          currentRaw = {};
        }

        const updatedRaw = {
          ...currentRaw,
          mentorCertification: {
            reviewedAt: new Date().toISOString(),
            mentorName: data.mentorName || 'Consultant Senior Boukarou OS',
            status: data.status || 'APPROVED', // APPROVED | ACTION_REQUIRED
            score: data.score || 85,
            recommendations: data.recommendations || [],
          },
        };

        await db.generatedDocument.update({
          where: { id: project.generatedDoc.id },
          data: {
            rawContent: JSON.stringify(updatedRaw),
            updatedAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Avis du mentor certifié enregistré avec succès',
      });
    }

    if (action === 'ENRICH_CANVAS_BLOCK') {
      // Mise à jour ciblée d'un bloc de BMC ou Lean Canvas
      const { canvasType, blockKey, newItems } = data;
      if (project.generatedDoc && canvasType && blockKey && Array.isArray(newItems)) {
        const targetCanvas = project.generatedDoc.canvases.find(c => c.canvasType === canvasType);
        if (targetCanvas) {
          const currentBlocks = JSON.parse(targetCanvas.blocks);
          const existingList = Array.isArray(currentBlocks[blockKey]) ? currentBlocks[blockKey] : [];
          
          // Fusion dédoublonnée
          const merged = Array.from(new Set([...newItems, ...existingList])).slice(0, 6);
          currentBlocks[blockKey] = merged;

          await db.canvasData.update({
            where: { id: targetCanvas.id },
            data: {
              blocks: JSON.stringify(currentBlocks),
              updatedAt: new Date(),
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Bloc Canvas mis à jour avec les insights vérifiés',
      });
    }

    return NextResponse.json({ error: `Action '${action}' non reconnue` }, { status: 400 });
  } catch (error: unknown) {
    console.error('[n8n-inbound-webhook] Erreur de traitement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne de traitement' },
      { status: 500 }
    );
  }
}
