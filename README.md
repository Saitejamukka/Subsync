# ⚡ SubSync - Smart Subscription & Expense Tracker

> A modern, full-stack web application designed to help users track, manage, and optimize recurring subscription expenses. Features automated renewal alerts, spend analytics, smart cost-saving insights, multi-currency support, and secure user authentication.

[![Live Demo](https://img.shields.io/badge/Live_Demo-SubSync-10B981?style=for-the-badge&logo=render)](https://subsync-d0a6.onrender.com)
[![React](https://img.shields.io/badge/Frontend-React_18-0284C7?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-059669?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-047857?style=for-the-badge&logo=sqlite)](https://sqlite.org/)

---

## 🌟 Live Demo

👉 **[https://subsync-d0a6.onrender.com](https://subsync-d0a6.onrender.com)**

---

## ✨ Features

- 💳 **Subscription CRUD Store**: Manage recurring subscriptions with brand presets (Netflix, Spotify, ChatGPT Plus, GitHub Copilot, Adobe CC, etc.).
- 🔒 **User Authentication**: Secure Sign In & Registration powered by JWT & bcrypt password hashing.
- ⏰ **Automated Renewal Cron Alerts**: Daily background audits powered by `node-cron` flagging overdue and upcoming payments.
- 📊 **Interactive Spend Analytics**: Doughnut category charts, 12-month expense trend lines, and payment method bar charts powered by **Chart.js**.
- 💡 **Smart Savings Radar**: Algorithmic engine identifying annual plan discount opportunities (~17% savings) and category overlaps.
- 🌐 **Multi-Currency Normalization**: Instant currency switcher ($ USD, € EUR, £ GBP, ₹ INR, C$ CAD, A$ AUD, ¥ JPY).
- 💾 **Data Backup & Restore**: Export and import subscription JSON data backups.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Chart.js
- **Backend**: Node.js, Express.js, Node-Cron, JWT, Bcryptjs
- **Database**: SQLite (`sqlite3`)
- **Styling**: Vanilla CSS with custom design system, light green palette, glassmorphism, responsive grid layout

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/Saitejamukka/subsync.git
cd subsync

# 2. Install dependencies
npm install

# 3. Start full-stack development server (Backend :5000 & Frontend :3000)
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
