import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// Admin middleware
async function verifyAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return null;
  }
  
  return session;
}

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user stats
    const totalUsers = await db.user.count();
    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Get subscription stats
    const subscriptions = await db.subscription.groupBy({
      by: ['plan'],
      _count: true,
    });

    const planCounts: Record<string, number> = {
      FREE: 0,
      BASIC: 0,
      PRO: 0,
    };

    subscriptions.forEach(sub => {
      planCounts[sub.plan] = sub._count;
    });

    // Get project stats
    const totalProjects = await db.project.count();
    const projectsThisMonth = await db.project.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Get document stats
    const totalDocuments = await db.generatedDocument.count();
    const documentsThisMonth = await db.generatedDocument.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Get export stats
    const totalExports = await db.export.count();
    const exportsThisMonth = await db.export.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Get sector distribution
    const sectorDistribution = await db.project.groupBy({
      by: ['sector'],
      _count: true,
    });

    // Get country distribution
    const countryDistribution = await db.project.groupBy({
      by: ['country'],
      _count: true,
    });

    // Calculate revenue estimate
    const revenue = {
      thisMonth: planCounts['BASIC'] * 7 + planCounts['PRO'] * 19,
      total: totalUsers * 0.5 * 12, // Rough estimate
    };

    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        growth: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : '0',
      },
      subscriptions: planCounts,
      projects: {
        total: totalProjects,
        thisMonth: projectsThisMonth,
      },
      documents: {
        total: totalDocuments,
        thisMonth: documentsThisMonth,
      },
      exports: {
        total: totalExports,
        thisMonth: exportsThisMonth,
      },
      revenue,
      charts: {
        sectorDistribution: sectorDistribution.map(s => ({
          sector: s.sector,
          count: s._count,
        })),
        countryDistribution: countryDistribution.map(c => ({
          country: c.country,
          count: c._count,
        })),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
