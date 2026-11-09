import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { LoginSchema } from './validations';

const LOCKOUT_WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

function checkRateLimit(identifier: string): boolean {
  const db = getDb();
  const windowStart = new Date(
    Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const result = db
    .prepare(
      `SELECT COUNT(*) as count FROM login_attempts
       WHERE identifier = ? AND attempted_at > ? AND success = 0`
    )
    .get(identifier, windowStart) as { count: number };

  return result.count >= MAX_FAILED_ATTEMPTS;
}

function recordAttempt(identifier: string, success: boolean): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO login_attempts (identifier, success) VALUES (?, ?)`
  ).run(identifier, success ? 1 : 0);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;

        // Check rate limit
        if (checkRateLimit(username)) {
          throw new Error('Account temporarily locked. Try again in 15 minutes.');
        }

        const db = getDb();
        const user = db
          .prepare(`SELECT * FROM admin_users WHERE username = ?`)
          .get(username) as
          | { id: string; username: string; password_hash: string }
          | undefined;

        if (!user) {
          recordAttempt(username, false);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
          recordAttempt(username, false);
          return null;
        }

        recordAttempt(username, true);

        return {
          id: user.id,
          name: user.username,
          email: `${user.username}@tclothes.local`,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
