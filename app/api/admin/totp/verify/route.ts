import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { decryptTotpSecret, verifyTotp } from '@/lib/totp';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code : '';
    const db = getDb();
    const user = db.prepare('SELECT totp_secret, totp_enabled FROM admin_users WHERE id = ?')
      .get(session.user.id) as { totp_secret: string | null; totp_enabled: number } | undefined;
    if (!user?.totp_secret) return NextResponse.json({ error: 'Start setup before verifying a code' }, { status: 400 });
    if (user.totp_enabled) return NextResponse.json({ error: 'Authenticator is already enabled' }, { status: 409 });
    if (!verifyTotp(decryptTotpSecret(user.totp_secret), code)) {
      return NextResponse.json({ error: 'Invalid code. Check your device time and try again.' }, { status: 400 });
    }
    db.prepare('UPDATE admin_users SET totp_enabled = 1 WHERE id = ?').run(session.user.id);
    return NextResponse.json({ enabled: true });
  } catch (error) {
    console.error('POST /api/admin/totp/verify error:', error);
    return NextResponse.json({ error: 'Could not verify authenticator code' }, { status: 500 });
  }
}
