# 📚 Hussain Library

A modern, responsive full-stack web application designed for managing both **Digital Books** and **Physical Books**, complete with a comprehensive **Admin Panel**, **Bagisto-inspired eCommerce & circulation desk**, and **zero demo data** (starts completely clean).

---

## ✨ Features & Architecture

### 1. 🛍️ Bagisto-Inspired eCommerce & Circulation Desk
- **Library Cart & Checkout**:
  - Add physical and digital titles directly to cart with real-time stock checks.
  - Checkout generates formatted Order Numbers (e.g. `HL-ORD-2026-0001`) and printable receipts/invoices.
- **Secure Downloadable Licenses (Bagisto Pattern)**:
  - Generates secure, authenticated 30-day download tokens (`/api/downloads/:token`) with quota tracking (`downloads_remaining`).
- **Admin Orders & Invoices Desk**:
  - Manage patron orders, update statuses (`Pending`, `Processing`, `Completed`, `Cancelled`), and review itemized order records.
- **Patron Wishlist**: Save favorite books with a heart icon for future reading.

### 2. 📚 Digital Library & Reading Suite
- **File Format Support**: Upload and store PDF, EPUB, TXT, and DOCX manuscripts.
- **In-Browser Reading Suite**:
  - Embedded PDF reader with page controls and zoom.
  - Text & Markdown reading mode with theme switching (Paper White, Warm Sepia, Night Mode) and adjustable font sizes.
- **Reader Notebook (Bookmarks & Notes)**:
  - Add instant bookmarks and personal study notes that auto-save directly to browser storage.

### 3. 🏢 Physical Library & Stacks Locator
- **Precise Shelf Tracking**: Map titles to specific locations (e.g. `Rack A-3, Shelf 2`).
- **🖨️ Printable Shelf & Spine Labels**:
  - Standardized 3" x 4" shelf tags with book metadata, high-visibility shelf location, total copies, and barcode patterns.
- **Circulation Desk**:
  - Issue physical volumes to registered patrons with custom due durations (7, 14, 30 days).
  - **Loan Renewals**: One-click renewal (`+14 Days`) directly from the Circulation Desk.
  - **Overdue Penalty Tracking**: Live calculation of late days and accumulated fine amounts.

### 4. ⚡ Open Library ISBN Quick Autofill
- Type or paste an ISBN (e.g. `9780140449136`) and click **"⚡ Autofill via ISBN"** to retrieve title, author, cover image, and description automatically.

### 5. 🔍 Spotlight Quick Search (`Ctrl + K` / `Cmd + K`)
- Instant search across physical shelf tags, digital archives, categories, and titles.

### 6. 📊 CSV Data Export & Backups
- One-click CSV backup downloads for **Books**, **Circulation Loans**, and **Members**.

---

## 🚀 How to Run

```bash
cd /data/user/0/com.termux/files/home/.gemini/antigravity-cli/scratch/hussain-library

# Start the application on port 3000
./start.sh
# or: node server/index.js
```

Open your browser to:
**`http://localhost:3000`**
