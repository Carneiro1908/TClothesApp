import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf',
};

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const match = /^([0-9a-f-]{36})\.(jpg|png|webp|gif|pdf)$/i.exec(params.filename);
  if (!match) return new NextResponse('Not found', { status: 404 });
  try {
    const directory = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    const image = await readFile(path.join(directory, params.filename));
    return new NextResponse(image, {
      headers: {
        'Content-Type': TYPES[match[2].toLowerCase()],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
