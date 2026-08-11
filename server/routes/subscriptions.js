import express from 'express';
import { query, run } from '../db.js';
import { checkUpcomingRenewals } from '../scheduler.js';

const router = express.Router();

// 1. GET /api/subscriptions - List all subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM subscriptions ORDER BY nextBillingDate ASC');
    // Format boolean autoRenew
    const formatted = rows.map(r => ({
      ...r,
      autoRenew: Boolean(r.autoRenew)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/subscriptions - Create new subscription
router.post('/subscriptions', async (req, res) => {
  try {
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

    const subId = id || `sub-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    const sql = `
      INSERT INTO subscriptions 
      (id, name, category, amount, currency, billingCycle, nextBillingDate, autoRenew, status, paymentMethod, reminderDays, notes, color, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await run(sql, [
      subId,
      name,
      category || 'other',
      parseFloat(amount) || 0,
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

// 3. PUT /api/subscriptions/:id - Update subscription
router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

    const sql = `
      UPDATE subscriptions SET
        name = ?, category = ?, amount = ?, currency = ?, billingCycle = ?,
        nextBillingDate = ?, autoRenew = ?, status = ?, paymentMethod = ?,
        reminderDays = ?, notes = ?, color = ?
      WHERE id = ?
    `;

    await run(sql, [
      name,
      category,
      parseFloat(amount),
      currency,
      billingCycle,
      nextBillingDate,
      autoRenew ? 1 : 0,
      status,
      paymentMethod,
      parseInt(reminderDays),
      notes,
      color,
      id
    ]);

    const updated = await query('SELECT * FROM subscriptions WHERE id = ?', [id]);
    if (updated.length === 0) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ ...updated[0], autoRenew: Boolean(updated[0].autoRenew) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. DELETE /api/subscriptions/:id - Delete subscription
router.delete('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM subscriptions WHERE id = ?', [id]);
    res.json({ message: 'Subscription deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/subscriptions/:id/mark-paid - Advance next billing date
router.post('/subscriptions/:id/mark-paid', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM subscriptions WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Subscription not found' });

    const sub = existing[0];
    const d = new Date(sub.nextBillingDate + 'T00:00:00');

    if (sub.billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else if (sub.billingCycle === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (sub.billingCycle === 'weekly') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);

    const nextStr = d.toISOString().split('T')[0];

    await run('UPDATE subscriptions SET nextBillingDate = ? WHERE id = ?', [nextStr, id]);
    const updated = await query('SELECT * FROM subscriptions WHERE id = ?', [id]);

    res.json({ ...updated[0], autoRenew: Boolean(updated[0].autoRenew) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/reminders/check - Manually trigger renewal check
router.post('/reminders/check', async (req, res) => {
  try {
    const alerts = await checkUpcomingRenewals();
    res.json({ count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
