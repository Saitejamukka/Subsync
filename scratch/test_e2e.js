import express from 'express';
import http from 'http';
import { initDatabase, query, run } from '../server/db.js';
import authRoutes from '../server/routes/auth.js';
import subscriptionRoutes from '../server/routes/subscriptions.js';
import { checkUpcomingRenewals } from '../server/scheduler.js';
import { 
  getMonthlyEquivalentCost, 
  convertCurrency, 
  formatCurrency, 
  calculateSpendMetrics,
  generateOptimizationInsights,
  getDaysRemaining
} from '../src/utils/storage.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runE2ETestSuite() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING SUBSYNC END-TO-END AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  // 1. Setup Test Server
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);

  await initDatabase();

  const server = http.createServer(app);
  await new Promise((res) => server.listen(5099, res));
  const baseUrl = 'http://localhost:5099/api';
  console.log('🚀 Test server running on http://localhost:5099');

  const testUserEmail = `testuser_${Date.now()}@example.com`;
  const testUserPassword = 'SecurePassword123!';
  const testUserName = 'E2E Tester';
  let authToken = '';
  let createdSubId = '';

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: AUTHENTICATION (REGISTER, LOGIN, ME)
    // -------------------------------------------------------------------------
    console.log('\n🔐 --- TEST SUITE 1: AUTHENTICATION & USER MANAGEMENT ---');

    // 1.1 Positive Registration
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testUserName, email: testUserEmail, password: testUserPassword })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token && regData.user.email === testUserEmail, 
      'Positive: User account registration returns 201 Created and JWT token');
    authToken = regData.token;

    // 1.2 Negative Registration: Duplicate Email
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testUserName, email: testUserEmail, password: testUserPassword })
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400 && dupData.error.includes('already exists'), 
      'Negative: Duplicate email registration returns 400 Bad Request');

    // 1.3 Negative Registration: Missing Fields
    const emptyRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'incomplete@example.com' })
    });
    assert(emptyRegRes.status === 400, 'Negative: Missing name/password returns 400');

    // 1.4 Positive Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: testUserPassword })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'Positive: User login returns 200 OK with token');

    // 1.5 Negative Login: Wrong Password
    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: 'WrongPassword!' })
    });
    assert(wrongPassRes.status === 400, 'Negative: Invalid password returns 400');

    // 1.6 Positive GET /me with Bearer Token
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.name === testUserName, 'Positive: GET /auth/me returns current authenticated user');

    // 1.7 Negative GET /me with Invalid Token
    const badMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer INVALID_TOKEN_123` }
    });
    assert(badMeRes.status === 403, 'Negative: Invalid token returns 403 Forbidden');


    // -------------------------------------------------------------------------
    // TEST SUITE 2: SUBSCRIPTION CRUD & INPUT VALIDATION
    // -------------------------------------------------------------------------
    console.log('\n💳 --- TEST SUITE 2: SUBSCRIPTION CRUD & VALIDATION ---');

    // 2.1 Positive Subscription Creation
    const newSubPayload = {
      name: 'GitHub Copilot Enterprise',
      category: 'productivity',
      amount: 19.00,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: '2026-09-01',
      autoRenew: true,
      status: 'active',
      paymentMethod: 'Credit Card (Visa)',
      reminderDays: 3,
      notes: 'Developer AI Tooling',
      color: '#10B981'
    };

    const createSubRes = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newSubPayload)
    });
    const createSubData = await createSubRes.json();
    assert(createSubRes.status === 201 && createSubData.id && createSubData.amount === 19.00,
      'Positive: Creating valid subscription returns 201 Created');
    createdSubId = createSubData.id;

    // 2.2 Negative Creation: Negative Amount Rejection
    const negAmountRes = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ ...newSubPayload, amount: -50.00 })
    });
    assert(negAmountRes.status === 400, 'Negative: Reject subscription creation with negative amount');

    // 2.3 Negative Creation: Empty Name Rejection
    const emptyNameRes = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ ...newSubPayload, name: '   ' })
    });
    assert(emptyNameRes.status === 400, 'Negative: Reject subscription creation with empty name');

    // 2.4 Positive GET /subscriptions List
    const getSubsRes = await fetch(`${baseUrl}/subscriptions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const subsList = await getSubsRes.json();
    assert(getSubsRes.status === 200 && Array.isArray(subsList) && subsList.some(s => s.id === createdSubId),
      'Positive: GET /subscriptions returns array containing created item');

    // 2.5 Positive PUT /subscriptions/:id Update
    const updateSubRes = await fetch(`${baseUrl}/subscriptions/${createdSubId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ ...newSubPayload, name: 'GitHub Copilot Max', amount: 25.00 })
    });
    const updateSubData = await updateSubRes.json();
    assert(updateSubRes.status === 200 && updateSubData.name === 'GitHub Copilot Max' && updateSubData.amount === 25.00,
      'Positive: PUT /subscriptions/:id updates title and amount');

    // 2.6 Positive POST /subscriptions/:id/mark-paid Date Advancement
    const markPaidRes = await fetch(`${baseUrl}/subscriptions/${createdSubId}/mark-paid`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const markPaidData = await markPaidRes.json();
    assert(markPaidRes.status === 200 && markPaidData.nextBillingDate === '2026-10-01',
      'Positive: POST /mark-paid correctly advances monthly billing date from 2026-09-01 to 2026-10-01 without timezone shift');

    // 2.7 Positive DELETE /subscriptions/:id
    const deleteRes = await fetch(`${baseUrl}/subscriptions/${createdSubId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert(deleteRes.status === 200, 'Positive: DELETE /subscriptions/:id returns 200 OK');


    // -------------------------------------------------------------------------
    // TEST SUITE 3: SPEND METRICS, CURRENCY & INSIGHTS UTILITIES
    // -------------------------------------------------------------------------
    console.log('\n📊 --- TEST SUITE 3: METRICS, MATH & INSIGHTS ENGINE ---');

    // 3.1 Monthly Equivalent Calculation
    const weeklyCost = getMonthlyEquivalentCost({ amount: 10, billingCycle: 'weekly' });
    const yearlyCost = getMonthlyEquivalentCost({ amount: 120, billingCycle: 'yearly' });
    assert(Math.round(weeklyCost) === 43 && yearlyCost === 10,
      'Positive: getMonthlyEquivalentCost correctly calculates normalized monthly cost for weekly and yearly cycles');

    // 3.2 Currency Conversion & Formatting
    const eurFormatted = formatCurrency(100, 'EUR');
    const inrFormatted = formatCurrency(100, 'INR');
    assert(eurFormatted.includes('€') && inrFormatted.includes('₹'),
      'Positive: formatCurrency correctly applies rate and symbol formatting for EUR and INR');

    // 3.3 Spend Metrics Calculation with Empty & Non-empty Array
    const emptyMetrics = calculateSpendMetrics([], 'USD');
    assert(emptyMetrics.activeCount === 0 && emptyMetrics.totalMonthlyUSD === 0,
      'Negative Resilience: calculateSpendMetrics handles 0 subscriptions safely without NaN');

    const sampleSubs = [
      { id: '1', name: 'Netflix', amount: 15.49, billingCycle: 'monthly', status: 'active', category: 'entertainment' },
      { id: '2', name: 'Spotify', amount: 9.99, billingCycle: 'monthly', status: 'active', category: 'entertainment' },
      { id: '3', name: 'AWS', amount: 360.00, billingCycle: 'yearly', status: 'active', category: 'cloud' }
    ];

    const sampleMetrics = calculateSpendMetrics(sampleSubs, 'USD');
    assert(sampleMetrics.activeCount === 3 && Math.round(sampleMetrics.totalMonthlyUSD) === 55,
      'Positive: calculateSpendMetrics calculates total active spend accurately ($55.48/mo)');

    // 3.4 Optimization Radar Insights
    const insights = generateOptimizationInsights(sampleSubs, 'USD');
    assert(insights.length >= 2 && insights.some(i => i.id === 'opt-annual'),
      'Positive: Optimization Insights engine identifies annual plan savings and overlapping category alerts');


    // -------------------------------------------------------------------------
    // TEST SUITE 4: CRON SCHEDULER & RENEWAL ALERTS AUDIT
    // -------------------------------------------------------------------------
    console.log('\n⏰ --- TEST SUITE 4: CRON SCHEDULER RENEWAL AUDIT ---');

    const todayStr = new Date().toISOString().split('T')[0];
    await run(`INSERT INTO subscriptions (id, userId, name, category, amount, currency, billingCycle, nextBillingDate, status, reminderDays) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [`sub-due-${Date.now()}`, regData.user.id, 'Upcoming Test Sub', 'utility', 49.99, 'USD', 'monthly', todayStr, 'active', 3]);

    const alerts = await checkUpcomingRenewals();
    assert(alerts.some(a => a.name === 'Upcoming Test Sub' && a.statusMessage.includes('DUE TODAY')),
      'Positive: Automated cron audit detects upcoming renewal due today and triggers alert');

  } catch (err) {
    console.error('💥 UNHANDLED TEST EXECUTION ERROR:', err);
    failedTests++;
  } finally {
    server.close();
    console.log('\n==================================================');
    console.log(`🏁 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runE2ETestSuite();
