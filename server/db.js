import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Helper functions wrapping sqlite3 callbacks into Promises
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize schema and seed sample data
export const initDatabase = async () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      billingCycle TEXT NOT NULL,
      nextBillingDate TEXT NOT NULL,
      autoRenew INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      paymentMethod TEXT,
      reminderDays INTEGER DEFAULT 3,
      notes TEXT,
      color TEXT,
      createdAt TEXT
    );
  `;

  await run(createTableSql);
  console.log('📋 Database table `subscriptions` verified.');

  // Check if empty and seed initial subscriptions
  const existing = await query('SELECT COUNT(*) as count FROM subscriptions');
  if (existing[0].count === 0) {
    console.log('🌱 Seeding sample subscriptions into SQLite database...');
    
    const getOffsetDate = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const seeds = [
      ['sub-1', 'ChatGPT Plus', 'productivity', 20.00, 'USD', 'monthly', getOffsetDate(2), 1, 'active', 'Credit Card (Visa)', 3, 'Used daily for coding assistant and research.', '#059669', getOffsetDate(-60)],
      ['sub-2', 'Netflix 4K Ultra HD', 'entertainment', 22.99, 'USD', 'monthly', getOffsetDate(5), 1, 'active', 'PayPal', 3, 'Shared family subscription account.', '#10B981', getOffsetDate(-120)],
      ['sub-3', 'GitHub Copilot', 'productivity', 100.00, 'USD', 'yearly', getOffsetDate(18), 1, 'active', 'Credit Card (Mastercard)', 7, 'Annual subscription saves $20/yr.', '#047857', getOffsetDate(-340)],
      ['sub-4', 'Spotify Premium Duo', 'entertainment', 14.99, 'USD', 'monthly', getOffsetDate(-1), 0, 'active', 'Apple Pay', 3, 'Check card balance before renewal.', '#16A34A', getOffsetDate(-180)],
      ['sub-5', 'iCloud+ 200GB Storage', 'utilities', 2.99, 'USD', 'monthly', getOffsetDate(12), 1, 'active', 'Apple Pay', 1, 'Backups for iPhone and Photos.', '#0284C7', getOffsetDate(-200)],
      ['sub-6', 'Equinox Gym & Wellness', 'fitness', 65.00, 'USD', 'monthly', getOffsetDate(24), 1, 'active', 'Debit Card', 5, 'Includes swimming pool & sauna access.', '#059669', getOffsetDate(-90)]
    ];

    const insertSql = `
      INSERT INTO subscriptions 
      (id, name, category, amount, currency, billingCycle, nextBillingDate, autoRenew, status, paymentMethod, reminderDays, notes, color, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const seed of seeds) {
      await run(insertSql, seed);
    }
    console.log('✅ Seeding complete. 6 subscriptions inserted.');
  }
};

export default db;
