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
  // 1. Create Users Table
  const createUsersSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `;
  await run(createUsersSql);
  console.log('📋 Database table `users` verified.');

  // 2. Create Subscriptions Table with userId
  const createSubsSql = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT,
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
      createdAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `;
  await run(createSubsSql);
  console.log('📋 Database table `subscriptions` verified.');

  // Check if userId column exists in older subscriptions table
  try {
    const tableInfo = await query("PRAGMA table_info(subscriptions)");
    const hasUserId = tableInfo.some(col => col.name === 'userId');
    if (!hasUserId) {
      console.log('🔄 Adding missing `userId` column to subscriptions table...');
      await run("ALTER TABLE subscriptions ADD COLUMN userId TEXT");
    }
  } catch (e) {
    console.error('Migration note:', e.message);
  }
};

export default db;
