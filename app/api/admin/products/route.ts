import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ProductSchema } from '@/lib/validations';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};

async function readProductForm(request: NextRequest) {
  const form = await request.formData();
  let imageUrl = String(form.get('image_url') || '').trim() || null;
  const image = form.get('image');
  if (image instanceof File && image.size > 0) {
    const extension = IMAGE_TYPES[image.type];
    if (!extension) throw new Error('Unsupported image type');
    if (image.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or smaller');
    const filename = `${uuidv4()}.${extension}`;
    const directory = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await image.arrayBuffer()));
    imageUrl = `/api/uploads/${filename}`;
  }
  return {
    name: form.get('name'), category: form.get('category'),
    description: String(form.get('description') || '').trim() || null,
    price: parseFloat(String(form.get('price'))), image_url: imageUrl,
    status: form.get('status'),
  };
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const products = db
      .prepare(
        `SELECT id, name, category, description, price, image_url, status, created_at
         FROM products
         ORDER BY created_at DESC`
      )
      .all();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: Awaited<ReturnType<typeof readProductForm>>;
    try { body = await readProductForm(request); }
    catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid image' }, { status: 400 });
    }
    const parsed = ProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, category, description, price, image_url, status } = parsed.data;
    const id = uuidv4();

    const db = getDb();
    db.prepare(
      `INSERT INTO products (id, name, category, description, price, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      name,
      category,
      description || null,
      price,
      image_url || null,
      status
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
