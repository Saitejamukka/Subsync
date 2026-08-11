import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { PieChart, TrendingUp, CreditCard } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { getMonthlyEquivalentCost, convertCurrency, formatCurrency } from '../utils/storage';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

export default function AnalyticsView({ subscriptions, currency }) {
  const activeSubs = subscriptions.filter(s => s.status === 'active');

  // --- 1. Category Doughnut Chart Data ---
  const categoryTotals = {};
  CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });

  activeSubs.forEach(sub => {
    const monthlyCostUSD = getMonthlyEquivalentCost(sub);
    const convertedCost = convertCurrency(monthlyCostUSD, currency);
    categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + convertedCost;
  });

  const activeCategoryList = CATEGORIES.filter(cat => categoryTotals[cat.id] > 0);

  const doughnutData = {
    labels: activeCategoryList.map(cat => cat.name),
    datasets: [
      {
        data: activeCategoryList.map(cat => categoryTotals[cat.id].toFixed(2)),
        backgroundColor: activeCategoryList.map(cat => cat.color),
        borderColor: '#111827',
        borderWidth: 2,
      }
    ]
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}`
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  // --- 2. 12-Month Expense Forecast Line Chart ---
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTotalVal = activeSubs.reduce((acc, sub) => {
    return acc + convertCurrency(getMonthlyEquivalentCost(sub), currency);
  }, 0);

  // Slight simulated monthly variations for dynamic realism
  const forecastDataPoints = months.map((m, idx) => {
    const variance = (idx % 3 === 0 ? 1.05 : idx % 2 === 0 ? 0.98 : 1.0);
    return (monthlyTotalVal * variance).toFixed(2);
  });

  const lineData = {
    labels: months,
    datasets: [
      {
        label: `Projected Spending (${currency})`,
        data: forecastDataPoints,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06B6D4',
        pointRadius: 4,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  // --- 3. Payment Method Bar Chart ---
  const methodTotals = {};
  activeSubs.forEach(sub => {
    const method = sub.paymentMethod || 'Credit Card';
    const cost = convertCurrency(getMonthlyEquivalentCost(sub), currency);
    methodTotals[method] = (methodTotals[method] || 0) + cost;
  });

  const barData = {
    labels: Object.keys(methodTotals),
    datasets: [
      {
        label: `Monthly Spend (${currency})`,
        data: Object.values(methodTotals).map(v => v.toFixed(2)),
        backgroundColor: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'],
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Category Breakdown Doughnut Chart */}
        <div className="calendar-wrapper" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Spending by Category</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {activeCategoryList.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>
                No active subscription data to chart.
              </div>
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
        </div>

        {/* Payment Method Distribution Bar Chart */}
        <div className="calendar-wrapper" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CreditCard size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Spend by Payment Method</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {Object.keys(methodTotals).length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>
                No payment method data available.
              </div>
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
        </div>
      </div>

      {/* 12-Month Expense Forecast Line Chart */}
      <div className="calendar-wrapper" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingUp size={20} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>12-Month Expense Projection Trend</h3>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}
