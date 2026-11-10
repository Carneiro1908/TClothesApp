import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ProductSchema } from '@/lib/validations';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'application/pdf': 'pdf',
};

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const form = await request.formData();
    let imageUrl = String(form.get('image_url') || '').trim() || null;
    const image = form.get('image');
    if (image && typeof image !== 'string' && image.size > 0) {
      const extension = IMAGE_TYPES[image.type];
      if (!extension) return NextResponse.json({ error: 'Use JPEG, PNG, WebP, GIF or PDF' }, { status: 400 });
      if (image.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 });
      const filename = `${uuidv4()}.${extension}`;
      const directory = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, filename), Buffer.from(await image.arrayBuffer()));
      imageUrl = `/api/uploads/${filename}`;
    }
    const parsed = ProductSchema.safeParse({
      name: form.get('name'), category: form.get('category'),
      description: String(form.get('description') || '').trim() || null,
      price: parseFloat(String(form.get('price'))), image_url: imageUrl, status: form.get('status'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, category, description, price, image_url, status } = parsed.data;

    db.prepare(
      `UPDATE products
       SET name = ?, category = ?, description = ?, price = ?, image_url = ?, status = ?
       WHERE id = ?`
    ).run(
      name,
      category,
      description || null,
      price,
      image_url || null,
      status,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('PUT /api/admin/products/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
