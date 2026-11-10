import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hussain_library.db');
export const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    name TEXT NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    category TEXT,
    type TEXT NOT NULL CHECK(type IN ('physical', 'digital', 'both')),
    description TEXT,
    cover_url TEXT,
    cover_file TEXT,
    shelf_location TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    file_path TEXT,
    file_format TEXT,
    file_size INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'returned', 'overdue')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_contact TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'fulfilled', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Bagisto-Inspired eCommerce & Circulation Extensions
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    order_type TEXT NOT NULL DEFAULT 'library_order',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')),
    total_qty INTEGER DEFAULT 1,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    book_type TEXT NOT NULL,
    qty INTEGER DEFAULT 1,
    shelf_location TEXT
  );

  CREATE TABLE IF NOT EXISTS download_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    customer_email TEXT,
    downloads_remaining INTEGER DEFAULT 5,
    max_downloads INTEGER DEFAULT 5,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS inventory_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS book_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    format_preference TEXT DEFAULT 'any',
    requester_name TEXT,
    requester_contact TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS combos_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    original_price REAL DEFAULT 0,
    offer_price REAL NOT NULL,
    badge TEXT,
    is_active INTEGER DEFAULT 1,
    book_ids TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS combo_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    selected_books TEXT,
    total_original_price REAL DEFAULT 0,
    combo_discount_percent REAL DEFAULT 15,
    combo_price REAL DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// Safe migrations for newly added columns if table already existed
try {
  const loanCols = db.prepare("PRAGMA table_info(loans)").all().map(c => c.name);
  if (!loanCols.includes('renew_count')) {
    db.exec("ALTER TABLE loans ADD COLUMN renew_count INTEGER DEFAULT 0");
  }

  const bookCols = db.prepare("PRAGMA table_info(books)").all().map(c => c.name);
  if (!bookCols.includes('price')) {
    db.exec("ALTER TABLE books ADD COLUMN price REAL DEFAULT 0");
  }
  if (!bookCols.includes('status')) {
    db.exec("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'published'");
  }

  const orderCols = db.prepare("PRAGMA table_info(orders)").all().map(c => c.name);
  if (!orderCols.includes('total_amount')) {
    db.exec("ALTER TABLE orders ADD COLUMN total_amount REAL DEFAULT 0");
  }
  if (!orderCols.includes('payment_status')) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'");
  }

  const itemCols = db.prepare("PRAGMA table_info(order_items)").all().map(c => c.name);
  if (!itemCols.includes('price')) {
    db.exec("ALTER TABLE order_items ADD COLUMN price REAL DEFAULT 0");
  }
} catch (e) {
  // Columns might already exist
}

// Ensure default settings exist
const getSettingStmt = db.prepare("SELECT value FROM settings WHERE key = ?");
const setSettingStmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");

if (!getSettingStmt.get('daily_fine_rate')) setSettingStmt.run('daily_fine_rate', '1.00');
if (!getSettingStmt.get('currency_symbol')) setSettingStmt.run('currency_symbol', '₹');
if (!getSettingStmt.get('default_loan_days')) setSettingStmt.run('default_loan_days', '14');
if (!getSettingStmt.get('max_renewals')) setSettingStmt.run('max_renewals', '3');


// Password utilities with enhanced scrypt parameters
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  try {
    const verifyHash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch {
    return false;
  }
}

export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long for security' };
  }
  const weakPasswords = ['12345678', 'password', 'admin123', 'qwerty123', 'library123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'Password is too common and easily guessable' };
  }
  return { valid: true };
}

export function hasAdminUser() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
  const result = stmt.get('admin');
  return (result?.count || 0) > 0;
}

export function createAdmin({ username, password, name, email }) {
  const { hash, salt } = hashPassword(password);
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, password_salt, role, name, email)
    VALUES (?, ?, ?, 'admin', ?, ?)
  `);
  const result = stmt.run(username.trim(), hash, salt, name.trim(), email ? email.trim() : null);
  return result.lastInsertRowid;
}

export function updateAdminPassword(userId, newPassword) {
  const { hash, salt } = hashPassword(newPassword);
  db.prepare(`
    UPDATE users
    SET password_hash = ?, password_salt = ?
    WHERE id = ?
  `).run(hash, salt, userId);
  return true;
}
