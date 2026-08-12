import { SAMPLE_SUBSCRIPTIONS, CURRENCIES, BILLING_CYCLES } from '../constants.js';

const STORAGE_KEY = 'subsync_subscriptions_v1';
const PREFS_KEY = 'subsync_user_prefs_v1';

export const getInitialSubscriptions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading subscriptions from localStorage', e);
  }
  return SAMPLE_SUBSCRIPTIONS;
};

export const saveSubscriptions = (subscriptions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (e) {
    console.error('Error saving subscriptions to localStorage', e);
  }
};

export const getInitialPrefs = () => {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading prefs', e);
  }
  return {
    currency: 'USD',
    enableBrowserNotifications: false,
    defaultReminderDays: 3,
  };
};

export const savePrefs = (prefs) => {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving prefs', e);
  }
};

// Calculate normalized monthly cost for a subscription in USD
export const getMonthlyEquivalentCost = (sub) => {
  const amount = Number(sub.amount) || 0;
  switch (sub.billingCycle) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
};

// Convert currency from USD to target currency code
export const convertCurrency = (amountInUSD, targetCurrencyCode) => {
  const target = CURRENCIES[targetCurrencyCode] || CURRENCIES.USD;
  return amountInUSD * target.rate;
};

// Format currency amount nicely
export const formatCurrency = (amountInUSD, currencyCode = 'USD') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = convertCurrency(amountInUSD, currencyCode);
  return `${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Calculate total metrics across all subscriptions
export const calculateSpendMetrics = (subscriptions, currencyCode = 'USD') => {
  const activeSubs = subscriptions.filter(s => s.status === 'active');

  const totalMonthlyUSD = activeSubs.reduce((acc, sub) => acc + getMonthlyEquivalentCost(sub), 0);
  const totalYearlyUSD = totalMonthlyUSD * 12;

  const highestSubUSD = activeSubs.reduce((max, sub) => {
    const cost = getMonthlyEquivalentCost(sub);
    return cost > max.cost ? { name: sub.name, cost } : max;
  }, { name: 'None', cost: 0 });

  const avgMonthlyUSD = activeSubs.length > 0 ? totalMonthlyUSD / activeSubs.length : 0;

  return {
    activeCount: activeSubs.length,
    totalCount: subscriptions.length,
    totalMonthlyUSD,
    totalYearlyUSD,
    avgMonthlyUSD,
    highestSub: highestSubUSD,
    formattedMonthly: formatCurrency(totalMonthlyUSD, currencyCode),
    formattedYearly: formatCurrency(totalYearlyUSD, currencyCode),
    formattedAvg: formatCurrency(avgMonthlyUSD, currencyCode),
    formattedHighest: formatCurrency(highestSubUSD.cost, currencyCode)
  };
};

// Calculate days remaining until renewal
export const getDaysRemaining = (nextBillingDateStr) => {
  if (!nextBillingDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const billingDate = new Date(nextBillingDateStr + 'T00:00:00');
  billingDate.setHours(0, 0, 0, 0);

  const diffTime = billingDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate status urgency
export const getRenewalUrgency = (nextBillingDateStr) => {
  const days = getDaysRemaining(nextBillingDateStr);
  if (days < 0) return { label: `Overdue (${Math.abs(days)}d ago)`, level: 'overdue', color: '#EF4444' };
  if (days === 0) return { label: 'Due Today!', level: 'today', color: '#F59E0B' };
  if (days <= 3) return { label: `Due in ${days} day${days > 1 ? 's' : ''}`, level: 'urgent', color: '#F97316' };
  if (days <= 7) return { label: `Due in ${days} days`, level: 'soon', color: '#3B82F6' };
  return { label: `Due in ${days} days`, level: 'normal', color: '#10B981' };
};

// Optimization Radar Insights Engine
export const generateOptimizationInsights = (subscriptions, currencyCode = 'USD') => {
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const insights = [];

  // Rule 1: Potential Annual Plan Savings (switching monthly to yearly saves ~15-20%)
  const monthlySubs = activeSubs.filter(s => s.billingCycle === 'monthly');
  if (monthlySubs.length > 0) {
    const totalMonthlyCostUSD = monthlySubs.reduce((sum, s) => sum + Number(s.amount), 0);
    const estimatedAnnualSavingsUSD = totalMonthlyCostUSD * 12 * 0.17; // ~17% typical discount
    insights.push({
      id: 'opt-annual',
      type: 'savings',
      title: 'Potential Annual Plan Savings',
      description: `You have ${monthlySubs.length} monthly subscriptions (${formatCurrency(totalMonthlyCostUSD, currencyCode)}/mo). Switching them to annual billing could save up to ${formatCurrency(estimatedAnnualSavingsUSD, currencyCode)}/year.`,
      icon: 'PiggyBank',
      severity: 'high',
      actionableSubs: monthlySubs.map(s => s.id)
    });
  }

  // Rule 2: Overlapping Category Detection
  const categoryCounts = {};
  activeSubs.forEach(s => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const redundantCategories = Object.entries(categoryCounts).filter(([cat, count]) => count >= 2);
  redundantCategories.forEach(([cat, count]) => {
    const subsInCat = activeSubs.filter(s => s.category === cat);
    const names = subsInCat.map(s => s.name).join(', ');
    insights.push({
      id: `opt-category-${cat}`,
      type: 'redundancy',
      title: `Multiple ${cat.toUpperCase()} Subscriptions`,
      description: `You have ${count} active subscriptions in ${cat} (${names}). Audit if any are overlapping or unused.`,
      icon: 'Layers',
      severity: 'medium',
      actionableSubs: subsInCat.map(s => s.id)
    });
  });

  // Rule 3: High Individual Expense (> $30/month)
  const expensiveSubs = activeSubs.filter(s => getMonthlyEquivalentCost(s) >= 30);
  if (expensiveSubs.length > 0) {
    insights.push({
      id: 'opt-high-cost',
      type: 'cost',
      title: 'High-Cost Services Detected',
      description: `${expensiveSubs.length} of your subscriptions cost $30+/month equivalent. Review if you are getting maximum ROI.`,
      icon: 'TrendingUp',
      severity: 'info',
      actionableSubs: expensiveSubs.map(s => s.id)
    });
  }

  // Rule 4: Manual Auto-Renew Checklist for Overdue / Imminent
  const imminentSubs = activeSubs.filter(s => {
    const days = getDaysRemaining(s.nextBillingDate);
    return days <= 3;
  });
  if (imminentSubs.length > 0) {
    insights.push({
      id: 'opt-imminent',
      type: 'reminder',
      title: `${imminentSubs.length} Payments Due in Next 3 Days`,
      description: `Ensure your payment methods are funded or cancel unwanted subscriptions before auto-renewal charges hit.`,
      icon: 'Clock',
      severity: 'urgent',
      actionableSubs: imminentSubs.map(s => s.id)
    });
  }

  return insights;
};
