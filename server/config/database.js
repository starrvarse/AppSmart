import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database with config settings
const db = new Database(
  join(__dirname, '..', config.database.path), 
  { verbose: config.database.verbose ? console.log : null }
);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category_id INTEGER,
    base_unit_id INTEGER NOT NULL,
    base_rate REAL NOT NULL,
    base_wholesale_rate REAL,
    purchase_rate REAL,
    hsn_code TEXT,
    company_id INTEGER,
    tax_percentage REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (base_unit_id) REFERENCES units(id),
    FOREIGN KEY (company_id) REFERENCES product_companies(id)
  );

  CREATE TABLE IF NOT EXISTS product_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    unit_id INTEGER,
    conversion_rate REAL,
    retail_rate REAL,
    wholesale_rate REAL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    category_id INTEGER,
    unit_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT CHECK(type IN ('wholesale', 'retail')) NOT NULL DEFAULT 'retail',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_counter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    counter INTEGER NOT NULL DEFAULT 1,
    UNIQUE(year, month)
  );

  DROP TABLE IF EXISTS invoice_items;
  DROP TABLE IF EXISTS invoices;
  
  CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL CHECK(length(invoice_number) = 10) UNIQUE,
    customer_id INTEGER NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal REAL NOT NULL,
    manual_discount REAL DEFAULT 0,
    previous_balance REAL DEFAULT 0,
    total_discount REAL DEFAULT 0,
    total_tax REAL DEFAULT 0,
    charges REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT CHECK(status IN ('draft', 'created', 'paid', 'cancelled')) NOT NULL DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    rate REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS company (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    gst TEXT,
    phone TEXT,
    email TEXT,
    logo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('category', 'product')) NOT NULL,
    discount_type TEXT CHECK(discount_type IN ('percentage', 'flat', 'buy_x_get_y')) NOT NULL,
    discount_value REAL,
    buy_quantity INTEGER,
    free_quantity INTEGER,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scheme_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (scheme_id) REFERENCES schemes(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS scheme_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    FOREIGN KEY (scheme_id) REFERENCES schemes(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );
`);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export default db;
