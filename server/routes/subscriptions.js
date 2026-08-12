import express from 'express';
import { query, run } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkUpcomingRenewals } from '../scheduler.js';

const router = express.Router();

// Apply auth middleware to all subscription routes
router.use(authenticateToken);

// 1. GET /api/subscriptions - List subscriptions for logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await query('SELECT * FROM subscriptions WHERE userId = ? OR userId IS NULL ORDER BY nextBillingDate ASC', [userId]);
    const formatted = rows.map(r => ({
      ...r,
      autoRenew: Boolean(r.autoRenew)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/subscriptions - Create subscription for logged-in user
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      id,
      name,
      category,
      amount,
      currency,
      billingCycle,
      nextBillingDate,
      autoRenew,
      status,
      paymentMethod,
      reminderDays,
      notes,
      color
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Subscription name is required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Subscription amount must be a positive number greater than 0.' });
    }

    if (!nextBillingDate) {
      return res.status(400).json({ error: 'Next billing date is required.' });
    }

    const subId = id || `sub-${Date.now()}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const sql = `
      INSERT INTO subscriptions 
      (id, userId, name, category, amount, currency, billingCycle, nextBillingDate, autoRenew, status, paymentMethod, reminderDays, notes, color, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await run(sql, [
      subId,
      userId,
      name.trim(),
      category || 'other',
      parsedAmount,
      currency || 'USD',
      billingCycle || 'monthly',
      nextBillingDate,
      autoRenew ? 1 : 0,
      status || 'active',
      paymentMethod || 'Credit Card (Visa)',
      parseInt(reminderDays) || 3,
      notes || '',
      color || '#10B981',
      createdAt
    ]);

    const created = await query('SELECT * FROM subscriptions WHERE id = ?', [subId]);
    res.status(201).json({ ...created[0], autoRenew: Boolean(created[0].autoRenew) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. PUT /api/subscriptions/:id - Update user's subscription
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      category,
      amount,
      currency,
      billingCycle,
      nextBillingDate,
      autoRenew,
      status,
      paymentMethod,
      reminderDays,
      notes,
      color
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Subscription name is required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Subscription amount must be a positive number greater than 0.' });
    }

    const sql = `
      UPDATE subscriptions SET
        name = ?, category = ?, amount = ?, currency = ?, billingCycle = ?,
        nextBillingDate = ?, autoRenew = ?, status = ?, paymentMethod = ?,
        reminderDays = ?, notes = ?, color = ?
      WHERE id = ? AND (userId = ? OR userId IS NULL)
    `;

    await run(sql, [
      name.trim(),
      category,
      parsedAmount,
      currency,
      billingCycle,
      nextBillingDate,
      autoRenew ? 1 : 0,
      status,
      paymentMethod,
      parseInt(reminderDays),
      notes,
      color,
      id,
      userId
    ]);

    const updated = await query('SELECT * FROM subscriptions WHERE id = ?', [id]);
    if (updated.length === 0) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ ...updated[0], autoRenew: Boolean(updated[0].autoRenew) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. DELETE /api/subscriptions/:id - Delete user's subscription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await run('DELETE FROM subscriptions WHERE id = ? AND (userId = ? OR userId IS NULL)', [id, userId]);
    res.json({ message: 'Subscription deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/subscriptions/:id/mark-paid - Advance renewal date
router.post('/:id/mark-paid', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = await query('SELECT * FROM subscriptions WHERE id = ? AND (userId = ? OR userId IS NULL)', [id, userId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Subscription not found' });

    const sub = existing[0];
    const parts = sub.nextBillingDate.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    if (sub.billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else if (sub.billingCycle === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (sub.billingCycle === 'weekly') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const nextStr = `${year}-${month}-${day}`;

    await run('UPDATE subscriptions SET nextBillingDate = ? WHERE id = ?', [nextStr, id]);
    const updated = await query('SELECT * FROM subscriptions WHERE id = ?', [id]);

    res.json({ ...updated[0], autoRenew: Boolean(updated[0].autoRenew) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
