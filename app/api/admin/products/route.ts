import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb, parseProductImages } from '@/lib/db';
import { ProductSchema } from '@/lib/validations';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'application/pdf': 'pdf',
};

async function readProductForm(request: NextRequest) {
  const form = await request.formData();
  const existingImagesValue = String(form.get('existing_images') || '[]');
  let imageUrls: string[] = [];
  try {
    const parsed: unknown = JSON.parse(existingImagesValue);
    if (Array.isArray(parsed)) imageUrls = parsed.filter((url): url is string => typeof url === 'string' && url.length > 0);
  } catch { throw new Error('Invalid product image list'); }
  for (const image of form.getAll('images')) {
    if (typeof image === 'string' || image.size === 0) continue;
    const extension = IMAGE_TYPES[image.type];
    if (!extension) throw new Error('Use JPEG, PNG, WebP, GIF or PDF');
    if (image.size > 5 * 1024 * 1024) throw new Error('Each file must be 5 MB or smaller');
    const filename = `${uuidv4()}.${extension}`;
    const directory = process.env.UPLOADS_DIR || (process.env.NODE_ENV === 'production'
      ? '/data/product-uploads'
      : path.join(process.cwd(), 'uploads'));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await image.arrayBuffer()));
    imageUrls.push(`/api/uploads/${filename}`);
  }
  return {
    name: form.get('name'), category: form.get('category'),
    description: String(form.get('description') || '').trim() || null,
    price: parseFloat(String(form.get('price'))), image_url: imageUrls[0] || null, image_urls: imageUrls,
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
        `SELECT id, name, category, description, price, image_url, image_urls, status, created_at
         FROM products
         ORDER BY created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;

    return NextResponse.json({ products: products.map((product) => {
      return { ...product, image_urls: parseProductImages(product.image_urls, product.image_url) };
    }) });
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
      `INSERT INTO products (id, name, category, description, price, image_url, image_urls, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      name,
      category,
      description || null,
      price,
      image_url || null,
      JSON.stringify(parsed.data.image_urls || (image_url ? [image_url] : [])),
      status
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
