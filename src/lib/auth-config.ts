// BizGen AI - Authentication Configuration (NextAuth v4)
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? 'USER';
        token.plan = user.plan ?? 'FREE';
      }
      
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
            const newUser = await db.user.create({
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
              include: { subscription: true },
            });
            
            user.id = newUser.id;
            user.role = newUser.role;
            user.plan = newUser.subscription?.plan ?? 'FREE';
          } else {
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.plan = existingUser.subscription?.plan ?? 'FREE';
          }
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-key-for-testing-only',
};
