import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const startTime = Date.now();

    // 1. Check PostgreSQL
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch (e) {
      dbStatus = 'down';
      console.error('Monitoring DB check failed:', e);
    }

    // 2. Check Python FastAPI Backend
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:3001';
    let apiStatus = 'unknown';
    let apiLatencyMs = 0;
    let apiDetails: any = null;

    try {
      const apiStart = Date.now();
      const res = await fetch(`${backendUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      apiLatencyMs = Date.now() - apiStart;
      if (res.ok) {
        apiStatus = 'healthy';
        apiDetails = await res.json().catch(() => null);
      } else {
        apiStatus = 'degraded';
      }
    } catch {
      apiStatus = 'unreachable';
    }

    // 3. Database Statistics
    const [userCount, projectCount, docCount, exportCount, auditCount] = await Promise.all([
      db.user.count().catch(() => 0),
      db.project.count().catch(() => 0),
      db.generatedDocument.count().catch(() => 0),
      db.export.count().catch(() => 0),
      db.auditLog.count().catch(() => 0),
    ]);

    // 4. Memory and System info
    const mem = process.memoryUsage();
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
    };

    const overallStatus = dbStatus === 'healthy' && (apiStatus === 'healthy' || apiStatus === 'unknown')
      ? 'HEALTHY'
      : 'DEGRADED';

    return NextResponse.json({
      status: overallStatus,
      checkedAt: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      services: {
        database: {
          name: 'PostgreSQL 16',
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        apiBackend: {
          name: 'FastAPI Backend',
          status: apiStatus,
          latencyMs: apiLatencyMs,
          details: apiDetails,
        },
        frontend: {
          name: 'Next.js App Server',
          status: 'healthy',
          systemInfo,
        },
      },
      counts: {
        users: userCount,
        projects: projectCount,
        generatedDocuments: docCount,
        exports: exportCount,
        auditLogs: auditCount,
      },
    });
  } catch (error) {
    console.error('Monitoring endpoint error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    );
  }
}
