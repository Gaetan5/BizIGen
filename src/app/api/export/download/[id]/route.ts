import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const format = searchParams.get('format') || '';

    const backendBaseUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:3001';
    const internalApiKey = process.env.INTERNAL_API_KEY;

    if (!internalApiKey) {
      return NextResponse.json(
        { error: 'Clé d\'authentification interne non configurée' },
        { status: 500 }
      );
    }

    const query = new URLSearchParams();
    if (type) query.set('type', type);
    if (format) query.set('format', format);

    const targetUrl = `${backendBaseUrl}/export/download/${id}${query.toString() ? `?${query.toString()}` : ''}`;

    const backendRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-Internal-API-Key': internalApiKey,
        'X-User-Id': session.user.id,
      },
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return NextResponse.json(
        { error: `Erreur backend: ${errorText}` },
        { status: backendRes.status }
      );
    }

    const contentType = backendRes.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = backendRes.headers.get('content-disposition') || `attachment; filename="export_${id}.${format || 'pdf'}"`;
    const buffer = await backendRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Erreur téléchargement export:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de l\'export' },
      { status: 500 }
    );
  }
}
