// BizGen AI - Authentication Configuration (NextAuth v4)
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Forcer NEXTAUTH_SECRET en production
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error(
    '[auth-config] NEXTAUTH_SECRET est manquant. Définissez cette variable d\'environnement avant de démarrer en production.'
  );
}

// Extend Next.js types for custom session properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: string;
      plan: string;
    };
  }

  interface User {
    role?: string;
    plan?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    plan?: string;
  }
}

const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: { subscription: true },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role,
            plan: user.subscription?.plan ?? 'FREE',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Connexion initiale avec Credentials
      if (user && account?.provider === 'credentials') {
        token.id = user.id;
        token.role = user.role ?? 'USER';
        token.plan = user.plan ?? 'FREE';
      }

      // Connexion Google : récupérer l'id depuis la BDD (M3 : fix)
      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email },
            include: { subscription: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.plan = dbUser.subscription?.plan ?? 'FREE';
          }
        } catch (error) {
          console.error('JWT Google lookup error:', error);
        }
      }

      // Mise à jour de session via trigger
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
            include: { subscription: true },
          });

          if (!existingUser) {
            await db.user.create({
              data: {
                email: user.email,
                name: user.name ?? null,
                avatarUrl: user.image ?? null,
                role: 'USER',
                locale: 'fr',
                subscription: {
                  create: {
                    status: 'ACTIVE',
                    plan: 'FREE',
                  },
                },
              },
            });
          }
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-key-for-local-only',
};
