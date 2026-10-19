// BizGen AI - Authentication Configuration (NextAuth v4)
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Forcer NEXTAUTH_SECRET obligatoirement via variable d'environnement
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    '[auth-config] NEXTAUTH_SECRET est strictement obligatoire. Définissez cette variable d\'environnement.'
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
      isImpersonating?: boolean;
      originalAdminEmail?: string;
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
const useSecureCookies = isProduction;
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const authOptions: NextAuthOptions = {
  useSecureCookies,
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
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
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

      // Connexion Google/GitHub : récupérer l'id depuis la BDD
      if ((account?.provider === 'google' || account?.provider === 'github') && token.email) {
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
          console.error('JWT Provider lookup error:', error);
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

        // Support de la connexion à distance (Impersonation) pour les ADMINs
        if (token.role === 'ADMIN') {
          try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const impersonateId = cookieStore.get('bizgen_impersonate_id')?.value;
            if (impersonateId && impersonateId !== token.id) {
              const targetUser = await db.user.findUnique({
                where: { id: impersonateId },
                include: { subscription: true },
              });
              if (targetUser) {
                session.user.id = targetUser.id;
                session.user.email = targetUser.email;
                session.user.name = targetUser.name ?? undefined;
                session.user.plan = targetUser.subscription?.plan ?? 'FREE';
                session.user.isImpersonating = true;
                session.user.originalAdminEmail = token.email as string;
              }
            }
          } catch {
            // Contexte statique ou sans headers
          }
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if ((account?.provider === 'google' || account?.provider === 'github') && user.email) {
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
          console.error('Provider sign in error:', error);
          return false;
        }
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
