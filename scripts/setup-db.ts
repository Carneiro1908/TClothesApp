import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Load env manually since this runs outside Next.js
import { readFileSync } from 'fs';

function loadEnv(envPath: string) {
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env.local not found, skip
  }
}

loadEnv(path.join(process.cwd(), '.env.local'));

const DB_PATH = path.join(process.cwd(), 'tclothes.db');

async function main() {
  console.log('🔧 Setting up TClothes database...\n');

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('tshirts','hoodies','windbreakers','pants')),
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','coming_soon','hidden')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
      success INTEGER NOT NULL DEFAULT 0
    );
  `);

  console.log('✅ Tables created/verified\n');

  // Seed admin user
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'TClothes@Admin2024!';

  const existingAdmin = db
    .prepare('SELECT id FROM admin_users WHERE username = ?')
    .get(username);

  if (!existingAdmin) {
    const hash = await bcrypt.hash(password, 12);
    const adminId = uuidv4();
    db.prepare(
      'INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)'
    ).run(adminId, username, hash);
    console.log(`✅ Admin user "${username}" created`);
  } else {
    console.log(`ℹ️  Admin user "${username}" already exists, skipping`);
  }

  // Seed example T-shirts
  const tshirts = [
    {
      name: 'TClothes Classic Black Tee',
      description:
        'The essential wardrobe piece. Our signature heavyweight 100% cotton t-shirt with the iconic TClothes emblem embroidered on the chest. Timeless, versatile, and built to last.',
      price: 49.99,
      image_url:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
      status: 'active',
    },
    {
      name: 'Achilles Design Oversized Tee',
      description:
        'An oversized silhouette with the exclusive Achilles Design graphic print on the back. Premium ring-spun cotton for ultimate comfort and a relaxed, street-ready fit.',
      price: 64.99,
      image_url:
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
      status: 'active',
    },
    {
      name: 'TClothes White Heritage Tee',
      description:
        'Clean, crisp, and effortless. The White Heritage Tee features subtle tonal branding and a slim-modern fit. Made from organic cotton for a soft hand feel and sustainable wear.',
      price: 54.99,
      image_url:
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80',
      status: 'active',
    },
  ];

  let seeded = 0;
  for (const shirt of tshirts) {
    const existing = db
      .prepare('SELECT id FROM products WHERE name = ?')
      .get(shirt.name);

    if (!existing) {
      db.prepare(
        `INSERT INTO products (id, name, category, description, price, image_url, status)
         VALUES (?, ?, 'tshirts', ?, ?, ?, ?)`
      ).run(uuidv4(), shirt.name, shirt.description, shirt.price, shirt.image_url, shirt.status);
      seeded++;
    }
  }

  if (seeded > 0) {
    console.log(`✅ ${seeded} example t-shirt(s) seeded`);
  } else {
    console.log('ℹ️  Example products already exist, skipping');
  }

  db.close();

  console.log('\n🎉 Database setup complete!');
  console.log('─────────────────────────────────────');
  console.log(`📦 Database: ${DB_PATH}`);
  console.log(`👤 Admin username: ${username}`);
  console.log(`🔑 Admin password: ${password}`);
  console.log('─────────────────────────────────────');
  console.log('\n🚀 Run `npm run dev` to start the development server');
  console.log('   Then open http://localhost:3000');
  console.log('   Admin panel: http://localhost:3000/admin/login\n');
}

main().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
