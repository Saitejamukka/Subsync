import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run } from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../email.js';

const router = express.Router();

// 1. POST /api/auth/register - Create account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    await run(
      'INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), cleanEmail, passwordHash, createdAt]
    );

    // Link any orphaned/demo subscriptions to this first registered user!
    await run('UPDATE subscriptions SET userId = ? WHERE userId IS NULL OR userId = ""', [userId]);

    // Sign JWT token
    const token = jwt.sign({ id: userId, email: cleanEmail, name: name.trim() }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: { id: userId, name: name.trim(), email: cleanEmail }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/auth/login - Sign In
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const rows = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT token
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/auth/me - Check current token session
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT id, name, email, createdAt FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/auth/forgot-password - Request password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const rows = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Generate 6-digit PIN code and expiration (15 minutes)
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetId = `reset-${Date.now()}`;
    const expiresAt = (Date.now() + 15 * 60 * 1000).toString();
    const createdAt = new Date().toISOString();

    // Clean old tokens and save new token
    await run('DELETE FROM password_resets WHERE email = ?', [cleanEmail]);
    await run(
      'INSERT INTO password_resets (id, email, token, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)',
      [resetId, cleanEmail, pinCode, expiresAt, createdAt]
    );

    // Send email via Nodemailer transport
    const emailResult = await sendPasswordResetEmail(cleanEmail, pinCode);

    res.json({
      message: `Password reset verification PIN sent to ${cleanEmail}.`,
      demoCode: pinCode,
      previewUrl: emailResult.previewUrl || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/auth/reset-password - Verify code and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, verification PIN code, and new password are required.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();

    // Verify token from database
    const resets = await query('SELECT * FROM password_resets WHERE email = ? AND token = ?', [cleanEmail, cleanToken]);

    if (resets.length === 0) {
      return res.status(400).json({ error: 'Invalid verification PIN code. Please check and try again.' });
    }

    const resetRecord = resets[0];
    if (Date.now() > parseInt(resetRecord.expiresAt)) {
      await run('DELETE FROM password_resets WHERE email = ?', [cleanEmail]);
      return res.status(400).json({ error: 'Verification PIN code has expired. Please request a new code.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password in database
    await run('UPDATE users SET password = ? WHERE email = ?', [passwordHash, cleanEmail]);

    // Delete used reset record
    await run('DELETE FROM password_resets WHERE email = ?', [cleanEmail]);

    res.json({ message: 'Password updated successfully! You can now sign in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

