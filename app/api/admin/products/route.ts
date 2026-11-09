import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ProductSchema } from '@/lib/validations';
import { v4 as uuidv4 } from 'uuid';

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
    const body = await request.json();

    const parsed = ProductSchema.safeParse({
      ...body,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
    });

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
