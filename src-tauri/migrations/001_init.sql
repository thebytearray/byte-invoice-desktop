CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS company (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    zipCode TEXT,
    country TEXT NOT NULL DEFAULT '',
    phone TEXT,
    email TEXT NOT NULL DEFAULT '',
    website TEXT,
    taxId TEXT,
    logo TEXT
);

CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zipCode TEXT,
    country TEXT NOT NULL,
    advancePayment REAL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoiceNumber TEXT NOT NULL,
    clientId TEXT NOT NULL,
    clientName TEXT NOT NULL,
    issueDate TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    subtotal REAL NOT NULL,
    taxRate REAL NOT NULL,
    taxAmount REAL NOT NULL,
    discountRate REAL NOT NULL,
    discountAmount REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    emailSent INTEGER,
    lastReminderSent TEXT
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoiceNumber);

CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoiceId TEXT NOT NULL,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoiceId);

CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY,
    smtp TEXT NOT NULL DEFAULT '{}',
    emailTemplates TEXT NOT NULL DEFAULT '[]'
);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('001_init');
