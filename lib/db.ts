import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'tclothes.db');
    db = new Database(dbPath);

    // Enable WAL mode for better concurrency
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
        image_urls TEXT NOT NULL DEFAULT '[]',
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

    const productColumns = db.prepare('PRAGMA table_info(products)').all() as Array<{ name: string }>;
    if (!productColumns.some((column) => column.name === 'image_urls')) {
      db.exec("ALTER TABLE products ADD COLUMN image_urls TEXT NOT NULL DEFAULT '[]'");
    }
  }

  return db;
}

export function parseProductImages(imageUrls: unknown, imageUrl?: unknown): string[] {
  if (typeof imageUrls === 'string') {
    try {
      const parsed: unknown = JSON.parse(imageUrls);
      if (Array.isArray(parsed)) {
        const urls = parsed.filter((url): url is string => typeof url === 'string' && url.length > 0);
        if (urls.length) return urls;
      }
    } catch {
      // Older records may not have a populated gallery column yet.
    }
  }
  return typeof imageUrl === 'string' && imageUrl ? [imageUrl] : [];
}

export default getDb;
