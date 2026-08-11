import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import { initScheduler, checkUpcomingRenewals } from './scheduler.js';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Serve built React static assets in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback all non-API routes to index.html for SPA routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(distPath, 'index.html'));
  }
});

// Boot Server
const startServer = async () => {
  try {
    await initDatabase();
    initScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 SubSync Full-Stack Server listening on http://localhost:${PORT}`);
      checkUpcomingRenewals();
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
  }
};

startServer();
