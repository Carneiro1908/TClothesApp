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
    let imageUrls: string[];
    try {
      const value: unknown = JSON.parse(String(form.get('existing_images') || '[]'));
      if (!Array.isArray(value) || !value.every((url) => typeof url === 'string')) throw new Error();
      imageUrls = value;
    } catch {
      return NextResponse.json({ error: 'Invalid product image list' }, { status: 400 });
    }
    for (const image of form.getAll('images')) {
      if (typeof image === 'string' || image.size === 0) continue;
      const extension = IMAGE_TYPES[image.type];
      if (!extension) return NextResponse.json({ error: 'Use JPEG, PNG, WebP, GIF or PDF' }, { status: 400 });
      if (image.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Each file must be 5 MB or smaller' }, { status: 400 });
      const filename = `${uuidv4()}.${extension}`;
      const directory = process.env.UPLOADS_DIR || (process.env.NODE_ENV === 'production'
        ? '/data/product-uploads'
        : path.join(process.cwd(), 'uploads'));
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, filename), Buffer.from(await image.arrayBuffer()));
      imageUrls.push(`/api/uploads/${filename}`);
    }
    const parsed = ProductSchema.safeParse({
      name: form.get('name'), category: form.get('category'),
      description: String(form.get('description') || '').trim() || null,
      price: parseFloat(String(form.get('price'))), image_url: imageUrls[0] || null,
      image_urls: imageUrls, status: form.get('status'),
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
       SET name = ?, category = ?, description = ?, price = ?, image_url = ?, image_urls = ?, status = ?
       WHERE id = ?`
    ).run(
      name,
      category,
      description || null,
      price,
      image_url || null,
      JSON.stringify(parsed.data.image_urls || (image_url ? [image_url] : [])),
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
