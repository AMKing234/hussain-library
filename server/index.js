import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  db,
  hasAdminUser,
  createAdmin,
  verifyPassword,
  validatePasswordStrength,
  updateAdminPassword
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const app = express();
const PORT = process.env.PORT || 3000;

// Secure Random Persistent JWT Secret Management
function getOrCreateJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    return process.env.JWT_SECRET;
  }
  const secretPath = path.join(dataDir, '.jwt_secret');
  if (fs.existsSync(secretPath)) {
    try {
      const s = fs.readFileSync(secretPath, 'utf8').trim();
      if (s.length >= 32) return s;
    } catch {}
  }
  const generated = crypto.randomBytes(48).toString('hex');
  try {
    fs.writeFileSync(secretPath, generated, { mode: 0o600 });
  } catch {}
  return generated;
}

const JWT_SECRET = getOrCreateJwtSecret();

// Ensure upload directories exist
const uploadDir = path.join(rootDir, 'uploads');
const booksUploadDir = path.join(uploadDir, 'books');
const coversUploadDir = path.join(uploadDir, 'covers');
fs.mkdirSync(booksUploadDir, { recursive: true });
fs.mkdirSync(coversUploadDir, { recursive: true });

// Allowed file extensions & MIME types for secure uploads
const ALLOWED_COVER_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_COVER_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_DIGITAL_EXTS = new Set(['.pdf', '.epub', '.txt', '.md']);
const ALLOWED_DIGITAL_MIMES = new Set(['application/pdf', 'application/epub+zip', 'text/plain', 'text/markdown', 'application/octet-stream']);

// Setup Multer with secure strict storage and file filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverFile') {
      cb(null, coversUploadDir);
    } else {
      cb(null, booksUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${cleanBase}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
    files: 2
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'coverFile') {
      if (!ALLOWED_COVER_EXTS.has(ext) || (file.mimetype && !ALLOWED_COVER_MIMES.has(file.mimetype))) {
        return cb(new Error('Invalid cover image format. Only JPG, PNG, and WebP are permitted.'));
      }
    } else if (file.fieldname === 'digitalFile') {
      if (!ALLOWED_DIGITAL_EXTS.has(ext)) {
        return cb(new Error('Invalid digital book file format. Only PDF, EPUB, TXT, and Markdown are permitted.'));
      }
    }
    cb(null, true);
  }
});

// Security Utilities & Path Traversal Guards
function getSafeFilePath(baseDir, filename) {
  if (!filename || typeof filename !== 'string') return null;
  const safeName = path.basename(filename);
  const resolved = path.resolve(baseDir, safeName);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    return null;
  }
  return resolved;
}

function sanitizeText(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip dangerous angle brackets to defeat stored XSS
    .trim()
    .slice(0, maxLength);
}

function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Neutralize CSV formula injection in spreadsheet applications (=, +, -, @, tab, cr)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// In-Memory Rate Limiter Middleware
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 15, message = 'Too many requests. Please try again later.' }) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    let record = hits.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(key, record);
      return next();
    }

    record.count++;
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: message, retryAfterSeconds: retryAfter });
    }

    next();
  };
}

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many authentication attempts. Please wait 15 minutes before retrying.' });
const downloadLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, message: 'Too many download requests. Please wait a minute.' });

// HTTP Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; frame-src 'self'; object-src 'self'; connect-src 'self' https://openlibrary.org;"
  );
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, filePath) => {
    // Prevent browser execution of uploaded scripts
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Auth Middleware with Bearer and Query Token Support
function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
      next();
    } else {
      res.status(403).json({ error: 'Administrator access required' });
    }
  });
}

// -------------------------------------------------------------
// 1. System & Authentication
// -------------------------------------------------------------

app.get('/api/system/status', (req, res) => {
  const hasAdmin = hasAdminUser();
  const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get().count;
  res.json({
    name: 'Hussain Library',
    initialized: hasAdmin,
    totalBooks: bookCount,
    version: '1.0.0'
  });
});

app.post('/api/auth/setup', authLimiter, (req, res) => {
  if (hasAdminUser()) {
    return res.status(400).json({ error: 'Admin account has already been initialized.' });
  }

  const { username, password, name, email } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and full name are required.' });
  }

  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    return res.status(400).json({ error: strengthCheck.error });
  }

  try {
    const adminId = createAdmin({
      username: sanitizeText(username, 50),
      password,
      name: sanitizeText(name, 100),
      email: email ? sanitizeText(email, 100) : null
    });
    const token = jwt.sign(
      { id: adminId, username: username.trim(), name: name.trim(), role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: { id: adminId, username: username.trim(), name: name.trim(), role: 'admin', email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const identifier = (req.body.username || req.body.email || '').trim();
  const password = req.body.password;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username or email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR (email IS NOT NULL AND lower(email) = lower(?))').get(identifier, identifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValid = verifyPassword(password, user.password_hash, user.password_salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logActivity(user.id, user.username, 'Admin Login', 'Administrator authenticated successfully', req.ip);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    }
  });
});

app.post('/api/auth/change-password', authenticateToken, authLimiter, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  const strengthCheck = validatePasswordStrength(new_password);
  if (!strengthCheck.valid) {
    return res.status(400).json({ error: strengthCheck.error });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isValid = verifyPassword(current_password, user.password_hash, user.password_salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  updateAdminPassword(user.id, new_password);
  res.json({ success: true, message: 'Password updated successfully' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, name, role, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Helper to record audit logs
function logActivity(userId, username, action, details, ip) {
  try {
    db.prepare(`
      INSERT INTO activity_logs (user_id, username, action, details, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId || null, username || 'System', action, details || null, ip || '127.0.0.1');
  } catch (e) {
    console.error('[ActivityLog Error]', e.message);
  }
}

// -------------------------------------------------------------
// 2. Dashboard Stats
// -------------------------------------------------------------

app.get('/api/stats', (req, res) => {
  // Update overdue loans status
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    UPDATE loans
    SET status = 'overdue'
    WHERE status = 'active' AND due_date < ?
  `).run(today);

  const totalBooks = db.prepare('SELECT COUNT(*) as count FROM books').get().count;
  const digitalBooks = db.prepare("SELECT COUNT(*) as count FROM books WHERE type IN ('digital', 'both')").get().count;
  const physicalBooks = db.prepare("SELECT COUNT(*) as count FROM books WHERE type IN ('physical', 'both')").get().count;

  const physicalCopies = db.prepare("SELECT COALESCE(SUM(total_copies), 0) as total, COALESCE(SUM(available_copies), 0) as available FROM books WHERE type IN ('physical', 'both')").get();
  
  const activeLoans = db.prepare("SELECT COUNT(*) as count FROM loans WHERE status = 'active'").get().count;
  const overdueLoans = db.prepare("SELECT COUNT(*) as count FROM loans WHERE status = 'overdue'").get().count;
  const returnedLoans = db.prepare("SELECT COUNT(*) as count FROM loans WHERE status = 'returned'").get().count;

  const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
  const totalReads = db.prepare('SELECT COALESCE(SUM(read_count), 0) as count FROM books').get().count;
  const totalDownloads = db.prepare('SELECT COALESCE(SUM(download_count), 0) as count FROM books').get().count;
  const pendingReservations = db.prepare("SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'").get().count;

  // Real orders & revenue metrics (Zero Demo Data — from actual DB)
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'").get().total;
  
  // Real customers
  const orderCustomers = db.prepare("SELECT COUNT(DISTINCT customer_email) as count FROM orders WHERE customer_email IS NOT NULL AND customer_email != ''").get().count;
  const totalCustomers = Math.max(totalMembers, orderCustomers);

  // Real weekly metrics
  const booksThisWeek = db.prepare("SELECT COUNT(*) as count FROM books WHERE created_at >= datetime('now', '-7 days')").get().count;
  const ordersThisWeek = db.prepare("SELECT COUNT(*) as count FROM orders WHERE created_at >= datetime('now', '-7 days')").get().count;
  const customersThisWeek = db.prepare("SELECT COUNT(*) as count FROM members WHERE created_at >= datetime('now', '-7 days')").get().count;
  const revenueThisWeek = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', '-7 days')").get().total;

  // Real weekly order chart overview (Mon-Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayIndexMap = { '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat', '0': 'Sun' };
  const rawOrdersByDay = db.prepare(`
    SELECT strftime('%w', created_at) as day_num, COUNT(*) as count
    FROM orders
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY day_num
  `).all();
  const ordersOverview = daysOfWeek.map(day => {
    const found = rawOrdersByDay.find(r => dayIndexMap[r.day_num] === day);
    return { day, count: found ? found.count : 0 };
  });

  // Real sales by category
  const salesByCategory = db.prepare(`
    SELECT b.category, COUNT(oi.id) as count, COALESCE(SUM(oi.price * oi.qty), 0) as total_amount
    FROM order_items oi
    JOIN books b ON oi.book_id = b.id
    GROUP BY b.category
    ORDER BY count DESC
  `).all();

  // Recent Orders (5)
  const recentOrders = db.prepare(`
    SELECT id, order_number, customer_name, customer_email, total_qty, total_amount, status, created_at
    FROM orders
    ORDER BY id DESC
    LIMIT 5
  `).all();

  // Recently Added Books (5)
  const recentlyAddedBooks = db.prepare(`
    SELECT id, title, category, price, status, cover_file, cover_url, created_at
    FROM books
    ORDER BY id DESC
    LIMIT 5
  `).all();

  res.json({
    totalBooks,
    digitalBooks,
    physicalBooks,
    totalCopies: physicalCopies.total,
    availableCopies: physicalCopies.available,
    issuedCopies: physicalCopies.total - physicalCopies.available,
    activeLoans,
    overdueLoans,
    returnedLoans,
    totalMembers,
    totalReads,
    totalDownloads,
    pendingReservations,
    totalOrders,
    totalCustomers,
    totalRevenue,
    booksThisWeek,
    ordersThisWeek,
    customersThisWeek,
    revenueThisWeek,
    ordersOverview,
    salesByCategory,
    recentOrders,
    recentlyAddedBooks
  });
});

// -------------------------------------------------------------
// 3. Books Catalog & Management
// -------------------------------------------------------------

app.get('/api/books', (req, res) => {
  const { search, type, category, available_only } = req.query;

  let query = `
    SELECT b.*,
           (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE book_id = b.id) as average_rating,
           (SELECT COUNT(*) FROM reviews WHERE book_id = b.id) as reviews_count
    FROM books b
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (title LIKE ? OR author LIKE ? OR isbn LIKE ? OR description LIKE ? OR shelf_location LIKE ?)`;
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  if (type && type !== 'all') {
    if (type === 'digital') {
      query += ` AND type IN ('digital', 'both')`;
    } else if (type === 'physical') {
      query += ` AND type IN ('physical', 'both')`;
    }
  }

  if (category && category !== 'all') {
    query += ` AND category = ?`;
    params.push(category);
  }

  if (available_only === 'true') {
    query += ` AND available_copies > 0`;
  }

  query += ' ORDER BY b.id DESC';

  const books = db.prepare(query).all(...params);
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const book = db.prepare(`
    SELECT b.*,
           (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE book_id = b.id) as average_rating,
           (SELECT COUNT(*) FROM reviews WHERE book_id = b.id) as reviews_count
    FROM books b
    WHERE b.id = ?
  `).get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  // Get active loans for this book
  const activeLoans = db.prepare(`
    SELECT l.*, m.name as member_name, m.membership_id
    FROM loans l
    JOIN members m ON l.member_id = m.id
    WHERE l.book_id = ? AND l.status IN ('active', 'overdue')
  `).all(book.id);

  // Get pending reservations
  const reservations = db.prepare(`
    SELECT * FROM reservations
    WHERE book_id = ? AND status = 'pending'
  `).all(book.id);

  // Get reviews
  const reviews = db.prepare(`
    SELECT * FROM reviews
    WHERE book_id = ?
    ORDER BY id DESC
  `).all(book.id);

  res.json({
    ...book,
    activeLoans,
    reservations,
    reviews
  });
});

// Reviews endpoints
app.post('/api/books/:id/reviews', (req, res) => {
  const { reviewer_name, rating, comment } = req.body;
  if (!reviewer_name || !rating) {
    return res.status(400).json({ error: 'Reviewer name and star rating (1-5) are required' });
  }

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  const book = db.prepare('SELECT id FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const cleanReviewer = sanitizeText(reviewer_name, 100);
  const cleanComment = comment ? sanitizeText(comment, 1000) : null;

  const result = db.prepare(`
    INSERT INTO reviews (book_id, reviewer_name, rating, comment)
    VALUES (?, ?, ?, ?)
  `).run(book.id, cleanReviewer, numRating, cleanComment);

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(review);
});

app.post('/api/books', requireAdmin, upload.fields([
  { name: 'coverFile', maxCount: 1 },
  { name: 'digitalFile', maxCount: 1 }
]), (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      type,
      description,
      cover_url,
      shelf_location,
      total_copies
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const bookType = type || 'physical';
    const copies = (bookType === 'digital') ? 0 : (parseInt(total_copies, 10) || 1);
    
    let coverFileName = null;
    if (req.files?.coverFile?.[0]) {
      coverFileName = req.files.coverFile[0].filename;
    }

    let digitalFilePath = null;
    let digitalFileFormat = null;
    let digitalFileSize = 0;

    if (req.files?.digitalFile?.[0]) {
      const file = req.files.digitalFile[0];
      digitalFilePath = file.filename;
      digitalFileFormat = path.extname(file.originalname).replace('.', '').toLowerCase();
      digitalFileSize = file.size;
    }

    const stmt = db.prepare(`
      INSERT INTO books (
        title, author, isbn, category, type, description,
        cover_url, cover_file, shelf_location, total_copies, available_copies,
        file_path, file_format, file_size, price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      author.trim(),
      isbn ? isbn.trim() : null,
      category ? category.trim() : 'General',
      bookType,
      description ? description.trim() : null,
      cover_url ? cover_url.trim() : null,
      coverFileName,
      shelf_location ? shelf_location.trim() : null,
      copies,
      copies,
      digitalFilePath,
      digitalFileFormat,
      digitalFileSize,
      parseFloat(req.body.price) || 0,
      req.body.status || 'published'
    );

    const created = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
    logActivity(req.user?.id, req.user?.username, 'Added Book', `Added book "${title.trim()}" (ID: ${result.lastInsertRowid})`, req.ip);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', requireAdmin, upload.fields([
  { name: 'coverFile', maxCount: 1 },
  { name: 'digitalFile', maxCount: 1 }
]), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Book not found' });

    const {
      title,
      author,
      isbn,
      category,
      type,
      description,
      cover_url,
      shelf_location,
      total_copies,
      price,
      status
    } = req.body;

    const bookType = type || existing.type;
    const newTotalCopies = (bookType === 'digital') ? 0 : (parseInt(total_copies, 10) || 1);
    
    // Calculate new available copies based on issued delta
    const issuedCount = existing.total_copies - existing.available_copies;
    const newAvailable = Math.max(0, newTotalCopies - Math.max(0, issuedCount));

    let coverFileName = existing.cover_file;
    if (req.files?.coverFile?.[0]) {
      coverFileName = req.files.coverFile[0].filename;
    }

    let digitalFilePath = existing.file_path;
    let digitalFileFormat = existing.file_format;
    let digitalFileSize = existing.file_size;

    if (req.files?.digitalFile?.[0]) {
      const file = req.files.digitalFile[0];
      digitalFilePath = file.filename;
      digitalFileFormat = path.extname(file.originalname).replace('.', '').toLowerCase();
      digitalFileSize = file.size;
    }

    db.prepare(`
      UPDATE books SET
        title = ?,
        author = ?,
        isbn = ?,
        category = ?,
        type = ?,
        description = ?,
        cover_url = ?,
        cover_file = ?,
        shelf_location = ?,
        total_copies = ?,
        available_copies = ?,
        file_path = ?,
        file_format = ?,
        file_size = ?,
        price = ?,
        status = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      title ? title.trim() : existing.title,
      author ? author.trim() : existing.author,
      isbn !== undefined ? (isbn ? isbn.trim() : null) : existing.isbn,
      category ? category.trim() : existing.category,
      bookType,
      description !== undefined ? (description ? description.trim() : null) : existing.description,
      cover_url !== undefined ? (cover_url ? cover_url.trim() : null) : existing.cover_url,
      coverFileName,
      shelf_location !== undefined ? (shelf_location ? shelf_location.trim() : null) : existing.shelf_location,
      newTotalCopies,
      newAvailable,
      digitalFilePath,
      digitalFileFormat,
      digitalFileSize,
      price !== undefined ? (parseFloat(price) || 0) : (existing.price || 0),
      status || existing.status || 'published',
      existing.id
    );

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(existing.id);
    logActivity(req.user?.id, req.user?.username, 'Updated Book', `Updated details for book "${updated.title}" (ID: ${existing.id})`, req.ip);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', requireAdmin, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  // Check if book has active loans
  const activeLoans = db.prepare("SELECT COUNT(*) as c FROM loans WHERE book_id = ? AND status IN ('active', 'overdue')").get(book.id);
  if (activeLoans.c > 0) {
    return res.status(400).json({ error: 'Cannot delete book with active loans. Return all copies first.' });
  }

  // Delete files securely with path traversal protection
  if (book.cover_file) {
    const cp = getSafeFilePath(coversUploadDir, book.cover_file);
    if (cp && fs.existsSync(cp)) fs.unlinkSync(cp);
  }
  if (book.file_path) {
    const bp = getSafeFilePath(booksUploadDir, book.file_path);
    if (bp && fs.existsSync(bp)) fs.unlinkSync(bp);
  }

  db.prepare('DELETE FROM books WHERE id = ?').run(book.id);
  logActivity(req.user?.id, req.user?.username, 'Deleted Book', `Deleted book "${book.title}" (ID: ${book.id})`, req.ip);
  res.json({ success: true, message: 'Book deleted successfully' });
});

// Stream or view digital book
app.get('/api/books/:id/read', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book || !book.file_path) {
    return res.status(404).json({ error: 'Digital book file not available' });
  }

  const filePath = getSafeFilePath(booksUploadDir, book.file_path);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server disk' });
  }

  // Increment read count
  db.prepare('UPDATE books SET read_count = read_count + 1 WHERE id = ?').run(book.id);

  const format = book.file_format?.toLowerCase();
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + encodeURIComponent(book.title) + '.pdf"');
  } else if (format === 'txt' || format === 'md') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
  }

  fs.createReadStream(filePath).pipe(res);
});

// Download digital book
app.get('/api/books/:id/download', downloadLimiter, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book || !book.file_path) {
    return res.status(404).json({ error: 'Digital book file not available' });
  }

  const filePath = getSafeFilePath(booksUploadDir, book.file_path);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server disk' });
  }

  // Increment download count
  db.prepare('UPDATE books SET download_count = download_count + 1 WHERE id = ?').run(book.id);

  const ext = book.file_format ? `.${book.file_format}` : '';
  const downloadName = `${book.title.replace(/[^a-zA-Z0-9_\- ]/g, '')}${ext}`;
  res.download(filePath, downloadName);
});

// -------------------------------------------------------------
// 4. Circulation & Loan Desk
// -------------------------------------------------------------

app.get('/api/loans', requireAdmin, (req, res) => {
  const { status } = req.query;

  // Refresh overdue status
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    UPDATE loans
    SET status = 'overdue'
    WHERE status = 'active' AND due_date < ?
  `).run(today);

  const fineRate = parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'daily_fine_rate'").get()?.value || '1.00');
  const currencySymbol = db.prepare("SELECT value FROM settings WHERE key = 'currency_symbol'").get()?.value || '$';

  let query = `
    SELECT l.*,
           b.title as book_title, b.author as book_author, b.shelf_location, b.cover_file, b.cover_url,
           m.name as member_name, m.membership_id, m.email as member_email, m.phone as member_phone
    FROM loans l
    JOIN books b ON l.book_id = b.id
    JOIN members m ON l.member_id = m.id
  `;

  const params = [];
  if (status && status !== 'all') {
    query += ' WHERE l.status = ?';
    params.push(status);
  }

  query += ' ORDER BY l.id DESC';

  const loans = db.prepare(query).all(...params);
  
  const enrichedLoans = loans.map(loan => {
    let overdueDays = 0;
    let fineAmount = 0;
    if (loan.status === 'overdue' || (loan.status === 'active' && loan.due_date < today)) {
      const diffMs = new Date(today) - new Date(loan.due_date);
      overdueDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      fineAmount = parseFloat((overdueDays * fineRate).toFixed(2));
    }
    return {
      ...loan,
      overdue_days: overdueDays,
      fine_amount: fineAmount,
      currency_symbol: currencySymbol
    };
  });

  res.json(enrichedLoans);
});

app.post('/api/loans/:id/renew', requireAdmin, (req, res) => {
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan record not found' });
  if (loan.status === 'returned') {
    return res.status(400).json({ error: 'Cannot renew a returned loan' });
  }

  const maxRenewals = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'max_renewals'").get()?.value || '3', 10);
  const currentRenews = loan.renew_count || 0;
  if (currentRenews >= maxRenewals) {
    return res.status(400).json({ error: `Maximum renewal limit of ${maxRenewals} reached for this loan.` });
  }

  const days = parseInt(req.body.days, 10) || 14;
  const currentDueDate = new Date(loan.due_date);
  const today = new Date();
  const baseDate = currentDueDate > today ? currentDueDate : today;
  baseDate.setDate(baseDate.getDate() + days);
  const newDueStr = baseDate.toISOString().split('T')[0];

  db.prepare(`
    UPDATE loans
    SET due_date = ?, status = 'active', renew_count = COALESCE(renew_count, 0) + 1
    WHERE id = ?
  `).run(newDueStr, loan.id);

  res.json({
    success: true,
    message: `Loan extended by ${days} days until ${newDueStr}`,
    new_due_date: newDueStr,
    renew_count: currentRenews + 1
  });
});

app.post('/api/loans/issue', requireAdmin, (req, res) => {
  const { book_id, member_id, due_days = 14, notes } = req.body;
  if (!book_id || !member_id) {
    return res.status(400).json({ error: 'Book ID and Member ID are required' });
  }

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.type === 'digital') {
    return res.status(400).json({ error: 'Digital books cannot be issued via physical loans. Members can read or download them directly.' });
  }

  if (book.available_copies <= 0) {
    return res.status(400).json({ error: 'No physical copies currently available for this book.' });
  }

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (member.status !== 'active') {
    return res.status(400).json({ error: 'Member account is currently suspended or inactive' });
  }

  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + parseInt(due_days, 10));

  const issueStr = issueDate.toISOString().split('T')[0];
  const dueStr = dueDate.toISOString().split('T')[0];

  // Perform transaction: insert loan, decrement available copies
  db.exec('BEGIN TRANSACTION');
  try {
    const loanResult = db.prepare(`
      INSERT INTO loans (book_id, member_id, issue_date, due_date, status, notes)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).run(book.id, member.id, issueStr, dueStr, notes ? notes.trim() : null);

    db.prepare(`
      UPDATE books
      SET available_copies = available_copies - 1
      WHERE id = ?
    `).run(book.id);

    db.exec('COMMIT');

    const createdLoan = db.prepare(`
      SELECT l.*, b.title as book_title, m.name as member_name
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
      WHERE l.id = ?
    `).get(loanResult.lastInsertRowid);

    res.status(201).json(createdLoan);
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loans/:id/return', requireAdmin, (req, res) => {
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan record not found' });
  if (loan.status === 'returned') {
    return res.status(400).json({ error: 'This loan has already been marked as returned' });
  }

  const today = new Date().toISOString().split('T')[0];

  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare(`
      UPDATE loans
      SET status = 'returned', return_date = ?
      WHERE id = ?
    `).run(today, loan.id);

    db.prepare(`
      UPDATE books
      SET available_copies = available_copies + 1
      WHERE id = ?
    `).run(loan.book_id);

    db.exec('COMMIT');

    res.json({ success: true, message: 'Book successfully returned and copy restored to inventory' });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. Members Directory
// -------------------------------------------------------------

app.get('/api/members', requireAdmin, (req, res) => {
  const members = db.prepare(`
    SELECT m.*,
           (SELECT COUNT(*) FROM loans WHERE member_id = m.id AND status IN ('active', 'overdue')) as active_loans_count
    FROM members m
    ORDER BY m.id DESC
  `).all();
  res.json(members);
});

app.post('/api/members', requireAdmin, (req, res) => {
  const { name, email, phone, address, membership_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Member name is required' });

  // Generate membership_id if not provided
  let memberCode = membership_id;
  if (!memberCode) {
    const count = db.prepare('SELECT COUNT(*) as c FROM members').get().c;
    memberCode = `HL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }

  try {
    const result = db.prepare(`
      INSERT INTO members (membership_id, name, email, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      memberCode.trim(),
      name.trim(),
      email ? email.trim() : null,
      phone ? phone.trim() : null,
      address ? address.trim() : null
    );

    const created = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/members/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Member not found' });

  const { name, email, phone, address, status, membership_id } = req.body;

  try {
    db.prepare(`
      UPDATE members SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
        status = ?,
        membership_id = ?
      WHERE id = ?
    `).run(
      name ? name.trim() : existing.name,
      email !== undefined ? (email ? email.trim() : null) : existing.email,
      phone !== undefined ? (phone ? phone.trim() : null) : existing.phone,
      address !== undefined ? (address ? address.trim() : null) : existing.address,
      status || existing.status,
      membership_id ? membership_id.trim() : existing.membership_id,
      existing.id
    );

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(existing.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', requireAdmin, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const activeLoans = db.prepare("SELECT COUNT(*) as c FROM loans WHERE member_id = ? AND status IN ('active', 'overdue')").get(member.id);
  if (activeLoans.c > 0) {
    return res.status(400).json({ error: 'Cannot delete member who currently has checked-out books. Return all books first.' });
  }

  db.prepare('DELETE FROM members WHERE id = ?').run(member.id);
  res.json({ success: true, message: 'Member deleted successfully' });
});

// -------------------------------------------------------------
// 6. Bagisto-Inspired eCommerce Orders & Download Tokens
// -------------------------------------------------------------

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, items, notes } = req.body;
  if (!customer_name || !customer_email || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer name, email, and at least one book item are required' });
  }

  // Generate order number HL-ORD-YYYY-XXXX
  const currentYear = new Date().getFullYear();
  const orderCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const orderNumber = `HL-ORD-${currentYear}-${String(orderCount + 1).padStart(4, '0')}`;

  db.exec('BEGIN TRANSACTION');
  try {
    let totalQty = 0;
    const orderItemsToInsert = [];
    const generatedTokens = [];

    for (const item of items) {
      const book = db.prepare('SELECT * FROM books WHERE id = ?').get(item.book_id);
      if (!book) {
        throw new Error(`Book with ID ${item.book_id} not found`);
      }

      const qty = parseInt(item.qty, 10) || 1;
      totalQty += qty;

      if ((book.type === 'physical' || book.type === 'both') && item.type !== 'digital') {
        if (book.available_copies < qty) {
          throw new Error(`Insufficient copies available for "${book.title}". Available: ${book.available_copies}`);
        }
        // Decrement physical copy inventory
        db.prepare('UPDATE books SET available_copies = available_copies - ? WHERE id = ?').run(qty, book.id);
      }

      orderItemsToInsert.push({
        book_id: book.id,
        book_title: book.title,
        book_type: item.type || book.type,
        qty,
        shelf_location: book.shelf_location
      });

      // If item is digital or book is digital, generate a secure download token
      if (item.type === 'digital' || book.type === 'digital' || (book.type === 'both' && item.type === 'digital')) {
        const tokenString = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day access

        generatedTokens.push({
          token: tokenString,
          book_id: book.id,
          book_title: book.title,
          customer_email: customer_email.trim(),
          downloads_remaining: 5,
          max_downloads: 5,
          expires_at: expiresAt.toISOString().split('T')[0]
        });
      }
    }

    // Insert master order record with sanitized fields
    const orderResult = db.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, total_qty, status, notes)
      VALUES (?, ?, ?, ?, ?, 'completed', ?)
    `).run(
      orderNumber,
      sanitizeText(customer_name, 100),
      sanitizeText(customer_email, 100),
      customer_phone ? sanitizeText(customer_phone, 50) : null,
      totalQty,
      notes ? sanitizeText(notes, 500) : null
    );

    const orderId = orderResult.lastInsertRowid;

    // Insert order items
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, book_id, book_title, book_type, qty, shelf_location)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const oi of orderItemsToInsert) {
      itemStmt.run(orderId, oi.book_id, oi.book_title, oi.book_type, oi.qty, oi.shelf_location);
    }

    // Insert download tokens
    const tokenStmt = db.prepare(`
      INSERT INTO download_tokens (token, order_id, book_id, customer_email, downloads_remaining, max_downloads, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const dt of generatedTokens) {
      tokenStmt.run(dt.token, orderId, dt.book_id, dt.customer_email, dt.downloads_remaining, dt.max_downloads, dt.expires_at);
    }

    db.exec('COMMIT');

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const createdItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({
      success: true,
      order: createdOrder,
      items: createdItems,
      download_tokens: generatedTokens
    });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const enriched = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const tokens = db.prepare('SELECT token, book_id, downloads_remaining, expires_at FROM download_tokens WHERE order_id = ?').all(order.id);
    return { ...order, items, tokens };
  });
  res.json(enriched);
});

app.put('/api/orders/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, message: `Order status updated to ${status}` });
});

// Bagisto-style Secure Tokenized File Download with Path Traversal Protection
app.get('/api/downloads/:token', downloadLimiter, (req, res) => {
  const tokenRecord = db.prepare('SELECT * FROM download_tokens WHERE token = ?').get(req.params.token);
  if (!tokenRecord) {
    return res.status(404).send('Invalid or expired download token.');
  }

  if (tokenRecord.downloads_remaining <= 0) {
    return res.status(403).send('Download quota exceeded. Maximum download attempts reached for this license token.');
  }

  const today = new Date().toISOString().split('T')[0];
  if (tokenRecord.expires_at && tokenRecord.expires_at < today) {
    return res.status(403).send('This download token has expired.');
  }

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(tokenRecord.book_id);
  if (!book || !book.file_path) {
    return res.status(404).send('Digital book file not found on library server.');
  }

  const filePath = getSafeFilePath(booksUploadDir, book.file_path);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('File missing or invalid path.');
  }

  // Decrement remaining download quota and increment book download count
  db.prepare('UPDATE download_tokens SET downloads_remaining = downloads_remaining - 1 WHERE id = ?').run(tokenRecord.id);
  db.prepare('UPDATE books SET download_count = download_count + 1 WHERE id = ?').run(book.id);

  const ext = book.file_format ? `.${book.file_format}` : '';
  const downloadName = `${book.title.replace(/[^a-zA-Z0-9_\- ]/g, '')}${ext}`;
  res.download(filePath, downloadName);
});

// Multi-Source Inventory Sources (Bagisto Style)
app.get('/api/inventory-sources', (req, res) => {
  const sources = db.prepare('SELECT * FROM inventory_sources WHERE is_active = 1 ORDER BY id ASC').all();
  res.json(sources);
});

app.post('/api/inventory-sources', requireAdmin, (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Source name and code are required' });

  try {
    const result = db.prepare(`
      INSERT INTO inventory_sources (name, code, description)
      VALUES (?, ?, ?)
    `).run(name.trim(), code.trim().toUpperCase(), description ? description.trim() : null);

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', (req, res) => {
  const { book_id, member_name, member_contact, notes } = req.body;
  if (!book_id || !member_name || !member_contact) {
    return res.status(400).json({ error: 'Book, name, and contact details are required' });
  }

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  try {
    const result = db.prepare(`
      INSERT INTO reservations (book_id, member_name, member_contact, notes)
      VALUES (?, ?, ?, ?)
    `).run(
      book.id,
      sanitizeText(member_name, 100),
      sanitizeText(member_contact, 100),
      notes ? sanitizeText(notes, 500) : null
    );

    res.status(201).json({ success: true, message: 'Reservation request submitted successfully!', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reservations', requireAdmin, (req, res) => {
  const list = db.prepare(`
    SELECT r.*, b.title as book_title, b.author as book_author, b.available_copies
    FROM reservations r
    JOIN books b ON r.book_id = b.id
    ORDER BY r.id DESC
  `).all();
  res.json(list);
});

app.put('/api/reservations/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'fulfilled', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid reservation status' });
  }

  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, message: `Reservation marked as ${status}` });
});

// Newsletter Subscription endpoint
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  const cleanEmail = sanitizeText(email, 120).toLowerCase();
  try {
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(cleanEmail);
    res.json({ success: true, message: 'Thank you for subscribing to Hussain Library dispatches!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record subscription.' });
  }
});

// Book Acquisition Request endpoint (Public reader request)
app.post('/api/book-requests', (req, res) => {
  const { title, author, format_preference, requester_name, requester_contact, notes } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Book title is required.' });
  }
  if (!requester_contact || typeof requester_contact !== 'string' || !requester_contact.trim()) {
    return res.status(400).json({ error: 'Contact number or email is required so we can notify you.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO book_requests (title, author, format_preference, requester_name, requester_contact, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      sanitizeText(title, 200),
      author ? sanitizeText(author, 150) : null,
      format_preference ? sanitizeText(format_preference, 20) : 'any',
      requester_name ? sanitizeText(requester_name, 100) : 'Anonymous Reader',
      sanitizeText(requester_contact, 120),
      notes ? sanitizeText(notes, 500) : null
    );

    res.status(201).json({
      success: true,
      message: 'Your book request has been submitted to the librarian! We will notify you once acquired.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not record your book request.' });
  }
});

// Admin view book requests
app.get('/api/admin/book-requests', requireAdmin, (req, res) => {
  const requests = db.prepare('SELECT * FROM book_requests ORDER BY id DESC').all();
  res.json(requests);
});

// Admin update book request status
app.patch('/api/admin/book-requests/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'in-review', 'acquired', 'unavailable'].includes(status)) {
    return res.status(400).json({ error: 'Invalid request status.' });
  }
  db.prepare('UPDATE book_requests SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, message: `Request status updated to ${status}` });
});

// -------------------------------------------------------------
// 7. Categories & Settings
// -------------------------------------------------------------

app.get('/api/categories', (req, res) => {
  const catsFromBooks = db.prepare('SELECT DISTINCT category as name FROM books WHERE category IS NOT NULL').all();
  const catsFromTable = db.prepare('SELECT name FROM categories').all();
  
  const map = new Set();
  catsFromBooks.forEach(c => c.name && map.add(c.name));
  catsFromTable.forEach(c => c.name && map.add(c.name));

  res.json(Array.from(map));
});

app.get('/api/settings', (req, res) => {
  const settingsRows = db.prepare('SELECT key, value FROM settings').all();
  const config = {};
  settingsRows.forEach(r => { config[r.key] = r.value; });
  res.json(config);
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const { daily_fine_rate, currency_symbol, default_loan_days, max_renewals } = req.body;
  const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  if (daily_fine_rate !== undefined) updateStmt.run('daily_fine_rate', String(daily_fine_rate));
  if (currency_symbol !== undefined) updateStmt.run('currency_symbol', String(currency_symbol));
  if (default_loan_days !== undefined) updateStmt.run('default_loan_days', String(default_loan_days));
  if (max_renewals !== undefined) updateStmt.run('max_renewals', String(max_renewals));

  res.json({ success: true, message: 'Settings updated successfully' });
});

// -------------------------------------------------------------
// 8. Data Export (CSV)
// -------------------------------------------------------------
// 7. CSV Export & Reporting (Secured against Formula Injection)
// -------------------------------------------------------------

app.get('/api/export/:type', requireAdmin, (req, res) => {
  const { type } = req.params;

  if (type === 'books') {
    const books = db.prepare('SELECT id, title, author, isbn, category, type, shelf_location, total_copies, available_copies, read_count, download_count, created_at FROM books ORDER BY id ASC').all();
    
    const headers = ['ID', 'Title', 'Author', 'ISBN', 'Category', 'Type', 'Shelf Location', 'Total Copies', 'Available Copies', 'Read Count', 'Download Count', 'Created At'];
    const rows = books.map(b => [
      sanitizeCsvCell(b.id),
      sanitizeCsvCell(b.title),
      sanitizeCsvCell(b.author),
      sanitizeCsvCell(b.isbn),
      sanitizeCsvCell(b.category),
      sanitizeCsvCell(b.type),
      sanitizeCsvCell(b.shelf_location),
      sanitizeCsvCell(b.total_copies),
      sanitizeCsvCell(b.available_copies),
      sanitizeCsvCell(b.read_count),
      sanitizeCsvCell(b.download_count),
      sanitizeCsvCell(b.created_at)
    ].join(','));

    const csv = [headers.map(sanitizeCsvCell).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hussain_library_books.csv"');
    return res.send(csv);
  }

  if (type === 'loans') {
    const loans = db.prepare(`
      SELECT l.id, b.title as book_title, m.name as member_name, m.membership_id,
             l.issue_date, l.due_date, l.return_date, l.status, l.renew_count, l.notes
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
      ORDER BY l.id DESC
    `).all();

    const headers = ['Loan ID', 'Book Title', 'Member Name', 'Membership ID', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Renewals', 'Notes'];
    const rows = loans.map(l => [
      sanitizeCsvCell(l.id),
      sanitizeCsvCell(l.book_title),
      sanitizeCsvCell(l.member_name),
      sanitizeCsvCell(l.membership_id),
      sanitizeCsvCell(l.issue_date),
      sanitizeCsvCell(l.due_date),
      sanitizeCsvCell(l.return_date || ''),
      sanitizeCsvCell(l.status),
      sanitizeCsvCell(l.renew_count || 0),
      sanitizeCsvCell(l.notes)
    ].join(','));

    const csv = [headers.map(sanitizeCsvCell).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hussain_library_circulation_loans.csv"');
    return res.send(csv);
  }

  if (type === 'members') {
    const members = db.prepare('SELECT id, membership_id, name, email, phone, address, status, created_at FROM members ORDER BY id ASC').all();
    const headers = ['ID', 'Membership ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Created At'];
    const rows = members.map(m => [
      sanitizeCsvCell(m.id),
      sanitizeCsvCell(m.membership_id),
      sanitizeCsvCell(m.name),
      sanitizeCsvCell(m.email),
      sanitizeCsvCell(m.phone),
      sanitizeCsvCell(m.address),
      sanitizeCsvCell(m.status),
      sanitizeCsvCell(m.created_at)
    ].join(','));

    const csv = [headers.map(sanitizeCsvCell).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hussain_library_members.csv"');
    return res.send(csv);
  }

  res.status(400).json({ error: 'Invalid export type. Choose books, loans, or members.' });
});

// -------------------------------------------------------------
// Activity Logs & Audit Trail (requireAdmin)
// -------------------------------------------------------------

app.get('/api/activity-logs', requireAdmin, (req, res) => {
  const logs = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 100').all();
  res.json(logs);
});

// -------------------------------------------------------------
// Combos & Special Offers
// -------------------------------------------------------------

app.get('/api/combos', (req, res) => {
  const combos = db.prepare('SELECT * FROM combos_offers WHERE is_active = 1 ORDER BY id DESC').all();
  res.json(combos);
});

app.post('/api/combos', requireAdmin, (req, res) => {
  const { title, description, original_price, offer_price, badge, book_ids } = req.body;
  if (!title || !offer_price) {
    return res.status(400).json({ error: 'Title and offer price are required' });
  }
  const result = db.prepare(`
    INSERT INTO combos_offers (title, description, original_price, offer_price, badge, book_ids)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    sanitizeText(title, 200),
    description ? sanitizeText(description, 500) : null,
    parseFloat(original_price) || 0,
    parseFloat(offer_price) || 0,
    badge ? sanitizeText(badge, 50) : null,
    book_ids ? JSON.stringify(book_ids) : null
  );
  logActivity(req.user.id, req.user.username, 'Created Combo Offer', `Created offer "${title}"`, req.ip);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Combo offer created' });
});

app.delete('/api/combos/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM combos_offers WHERE id = ?').run(req.params.id);
  logActivity(req.user.id, req.user.username, 'Deleted Combo Offer', `Deleted offer #${req.params.id}`, req.ip);
  res.json({ success: true, message: 'Offer deleted' });
});

// Custom Combo Pack Requests (Public Reader Endpoint)
app.post('/api/combo-requests', (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    selected_books,
    total_original_price,
    combo_discount_percent,
    combo_price,
    notes
  } = req.body;

  if (!customer_name || !customer_email) {
    return res.status(400).json({ error: 'Customer name and email are required.' });
  }

  if (!selected_books || (Array.isArray(selected_books) && selected_books.length === 0)) {
    return res.status(400).json({ error: 'Please select at least one book for your custom combo pack.' });
  }

  try {
    const booksJson = typeof selected_books === 'string' ? selected_books : JSON.stringify(selected_books);
    const result = db.prepare(`
      INSERT INTO combo_requests (
        customer_name, customer_email, customer_phone, customer_address,
        selected_books, total_original_price, combo_discount_percent, combo_price, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sanitizeText(customer_name, 100),
      sanitizeText(customer_email, 120),
      customer_phone ? sanitizeText(customer_phone, 40) : null,
      customer_address ? sanitizeText(customer_address, 300) : null,
      booksJson,
      parseFloat(total_original_price) || 0,
      parseFloat(combo_discount_percent) || 15,
      parseFloat(combo_price) || 0,
      notes ? sanitizeText(notes, 500) : null
    );

    logActivity(null, 'Public Patron', 'Requested Custom Combo Pack', `Customer ${customer_name} requested custom bundle #${result.lastInsertRowid}`, req.ip);

    res.status(201).json({
      success: true,
      message: 'Your custom combo request has been successfully submitted! We will contact you soon.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Failed to submit combo request:', err);
    res.status(500).json({ error: 'Could not record combo request.' });
  }
});

app.get('/api/combo-requests', requireAdmin, (req, res) => {
  const requests = db.prepare('SELECT * FROM combo_requests ORDER BY id DESC').all();
  res.json(requests);
});

app.patch('/api/combo-requests/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'fulfilled', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid combo request status.' });
  }
  db.prepare('UPDATE combo_requests SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, message: `Combo request status updated to ${status}` });
});

// -------------------------------------------------------------
// Admin Users List
// -------------------------------------------------------------

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, name, email, role, created_at FROM users ORDER BY id ASC').all();
  res.json(users);
});

// Category Management (Add & Delete)
app.post('/api/categories', requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' });
  const cleanName = sanitizeText(name, 100);
  try {
    db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(cleanName);
    logActivity(req.user.id, req.user.username, 'Added Category', `Added category "${cleanName}"`, req.ip);
    res.status(201).json({ success: true, message: `Category "${cleanName}" added` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:name', requireAdmin, (req, res) => {
  const catName = req.params.name;
  db.prepare('DELETE FROM categories WHERE name = ?').run(catName);
  logActivity(req.user.id, req.user.username, 'Deleted Category', `Deleted category "${catName}"`, req.ip);
  res.json({ success: true, message: `Category "${catName}" deleted` });
});

// -------------------------------------------------------------
// 8. Serve Client in Production & SPA Fallback
// -------------------------------------------------------------

const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile('index.html', { root: distDir }, (err) => {
        if (err && !res.headersSent) {
          res.status(404).json({ error: 'Page not found' });
        }
      });
    }
    next();
  });
}

// Global 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler (Scrubs stack traces and sensitive internals)
app.use((err, req, res, next) => {
  console.error('[Hussain Library Error]', err.message);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode >= 500 ? 'An internal error occurred. Request was safely halted.' : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hussain Library] Public site running on http://localhost:${PORT}`);
  console.log(`[Hussain Library] Storage: ${dataDir}/hussain_library.db`);
  console.log(`[Hussain Library] Admin Initialized: ${hasAdminUser() ? 'Yes' : 'No (Setup required on first visit)'}`);
});

// -------------------------------------------------------------
// 9. Dedicated Standalone Admin Portal on Port 3010
// -------------------------------------------------------------

const ADMIN_PORT = process.env.ADMIN_PORT || 3010;
const adminApp = express();
adminApp.disable('x-powered-by');

// Forward all API and uploads requests directly to main Express app before body consumption
adminApp.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return app(req, res, next);
  }
  next();
});

// Serve dist assets and admin.html as root SPA on Port 3010
if (fs.existsSync(distDir)) {
  const hasAdminHtml = fs.existsSync(path.join(distDir, 'admin.html'));
  const adminFile = hasAdminHtml ? 'admin.html' : 'index.html';

  // Explicit root route for Port 3010
  adminApp.get('/', (req, res) => {
    return res.sendFile(adminFile, { root: distDir });
  });

  // Serve static assets without auto-serving index.html on root
  adminApp.use(express.static(distDir, { index: false }));

  // Fallback for all other client routes on Port 3010
  adminApp.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(adminFile, { root: distDir });
    }
    next();
  });
}

adminApp.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`[Hussain Library Admin Portal] Dedicated Admin running on http://localhost:${ADMIN_PORT}`);
});
