export const CATEGORIES = [
  { id: 'entertainment', name: 'Entertainment & Streaming', color: '#00CEC9', bg: 'rgba(0, 206, 201, 0.15)', icon: 'Tv' },
  { id: 'productivity', name: 'Productivity & AI', color: '#0984E3', bg: 'rgba(9, 132, 227, 0.15)', icon: 'Cpu' },
  { id: 'utilities', name: 'Cloud & Utilities', color: '#74B9FF', bg: 'rgba(116, 185, 255, 0.15)', icon: 'Cloud' },
  { id: 'fitness', name: 'Health & Fitness', color: '#55E6C1', bg: 'rgba(85, 230, 193, 0.15)', icon: 'Activity' },
  { id: 'finance', name: 'Finance & Legal', color: '#F1C40F', bg: 'rgba(241, 196, 15, 0.15)', icon: 'DollarSign' },
  { id: 'gaming', name: 'Gaming', color: '#A29BFE', bg: 'rgba(162, 155, 254, 0.15)', icon: 'Gamepad2' },
  { id: 'other', name: 'Other', color: '#A4B0BE', bg: 'rgba(164, 176, 190, 0.15)', icon: 'Box' },
];

export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', rate: 1.0 },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', rate: 0.92 },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', rate: 0.79 },
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', rate: 83.2 },
  CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', rate: 1.35 },
  AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', rate: 1.52 },
  JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen', rate: 155.0 }
};

export const BILLING_CYCLES = [
  { id: 'monthly', label: 'Monthly', monthsFactor: 1 },
  { id: 'yearly', label: 'Yearly', monthsFactor: 12 },
  { id: 'quarterly', label: 'Quarterly', monthsFactor: 3 },
  { id: 'weekly', label: 'Weekly', monthsFactor: 0.25 },
];

export const PAYMENT_METHODS = [
  'Credit Card (Visa)',
  'Credit Card (Mastercard)',
  'Debit Card',
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Bank Transfer'
];

export const SERVICE_PRESETS = [
  { name: 'Netflix Premium', category: 'entertainment', amount: 22.99, cycle: 'monthly', color: '#E50914' },
  { name: 'Spotify Duo', category: 'entertainment', amount: 14.99, cycle: 'monthly', color: '#1DB954' },
  { name: 'ChatGPT Plus', category: 'productivity', amount: 20.00, cycle: 'monthly', color: '#10A37F' },
  { name: 'GitHub Copilot', category: 'productivity', amount: 100.00, cycle: 'yearly', color: '#16A34A' },
  { name: 'Adobe Creative Cloud', category: 'productivity', amount: 54.99, cycle: 'monthly', color: '#DC2626' },
  { name: 'iCloud+ 2TB', category: 'utilities', amount: 9.99, cycle: 'monthly', color: '#0284C7' },
  { name: 'Amazon Prime', category: 'entertainment', amount: 139.00, cycle: 'yearly', color: '#D97706' },
  { name: 'Gym & Spa Access', category: 'fitness', amount: 49.00, cycle: 'monthly', color: '#059669' },
  { name: 'YouTube Premium', category: 'entertainment', amount: 13.99, cycle: 'monthly', color: '#EF4444' },
];

const getOffsetDate = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const SAMPLE_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    name: 'ChatGPT Plus',
    category: 'productivity',
    amount: 20.00,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: getOffsetDate(2), // Due in 2 days!
    autoRenew: true,
    status: 'active',
    paymentMethod: 'Credit Card (Visa)',
    reminderDays: 3,
    notes: 'Used daily for coding assistant and research.',
    color: '#059669',
    createdAt: getOffsetDate(-60)
  },
  {
    id: 'sub-2',
    name: 'Netflix 4K Ultra HD',
    category: 'entertainment',
    amount: 22.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: getOffsetDate(5), // Due in 5 days
    autoRenew: true,
    status: 'active',
    paymentMethod: 'PayPal',
    reminderDays: 3,
    notes: 'Shared family subscription account.',
    color: '#10B981',
    createdAt: getOffsetDate(-120)
  },
  {
    id: 'sub-3',
    name: 'GitHub Copilot',
    category: 'productivity',
    amount: 100.00,
    currency: 'USD',
    billingCycle: 'yearly',
    nextBillingDate: getOffsetDate(18),
    autoRenew: true,
    status: 'active',
    paymentMethod: 'Credit Card (Mastercard)',
    reminderDays: 7,
    notes: 'Annual subscription saves $20/yr.',
    color: '#047857',
    createdAt: getOffsetDate(-340)
  },
  {
    id: 'sub-4',
    name: 'Spotify Premium Duo',
    category: 'entertainment',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: getOffsetDate(-1), // Overdue
    autoRenew: false,
    status: 'active',
    paymentMethod: 'Apple Pay',
    reminderDays: 3,
    notes: 'Check card balance before renewal.',
    color: '#16A34A',
    createdAt: getOffsetDate(-180)
  },
  {
    id: 'sub-5',
    name: 'iCloud+ 200GB Storage',
    category: 'utilities',
    amount: 2.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: getOffsetDate(12),
    autoRenew: true,
    status: 'active',
    paymentMethod: 'Apple Pay',
    reminderDays: 1,
    notes: 'Backups for iPhone and Photos.',
    color: '#0284C7',
    createdAt: getOffsetDate(-200)
  },
  {
    id: 'sub-6',
    name: 'Equinox Gym & Wellness',
    category: 'fitness',
    amount: 65.00,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: getOffsetDate(24),
    autoRenew: true,
    status: 'active',
    paymentMethod: 'Debit Card',
    reminderDays: 5,
    notes: 'Includes swimming pool & sauna access.',
    color: '#059669',
    createdAt: getOffsetDate(-90)
  }
];
