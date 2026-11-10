import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { authenticatorUri, encryptTotpSecret, generateTotpSecret } from '@/lib/totp';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const user = getDb().prepare('SELECT username, totp_enabled FROM admin_users WHERE id = ?')
      .get(session.user.id) as { username: string; totp_enabled: number } | undefined;
    if (!user) return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    return NextResponse.json({ enabled: Boolean(user.totp_enabled) });
  } catch (error) {
    console.error('GET /api/admin/totp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const user = db.prepare('SELECT username, totp_enabled FROM admin_users WHERE id = ?')
      .get(session.user.id) as { username: string; totp_enabled: number } | undefined;
    if (!user) return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    if (user.totp_enabled) return NextResponse.json({ error: 'Authenticator is already enabled' }, { status: 409 });

    const secret = generateTotpSecret();
    db.prepare('UPDATE admin_users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?')
      .run(encryptTotpSecret(secret), session.user.id);
    return NextResponse.json({ secret, uri: authenticatorUri(secret, user.username) });
  } catch (error) {
    console.error('POST /api/admin/totp error:', error);
    return NextResponse.json({ error: 'Could not start authenticator setup' }, { status: 500 });
  }
}
