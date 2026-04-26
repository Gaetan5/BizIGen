import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Middleware de protection des routes (m6 fix)
// Redirige vers /login si l'utilisateur n'est pas authentifié
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Protéger le panel admin : rôle ADMIN uniquement
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // L'utilisateur doit avoir un token valide pour accéder aux routes protégées
        return !!token;
      },
    },
  }
);

// Routes protégées par le middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/assistant/:path*',
    '/subscription/:path*',
    '/settings/:path*',
    '/help/:path*',
    '/admin/:path*',
  ],
};
