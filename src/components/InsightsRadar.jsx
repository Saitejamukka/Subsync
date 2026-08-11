import React from 'react';
import { 
  Sparkles, 
  PiggyBank, 
  Layers, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { generateOptimizationInsights } from '../utils/storage';

export default function InsightsRadar({ subscriptions, currency, onSelectCategoryFilter }) {
  const insights = generateOptimizationInsights(subscriptions, currency);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'PiggyBank': return <PiggyBank size={24} color="#10B981" />;
      case 'Layers': return <Layers size={24} color="#8B5CF6" />;
      case 'TrendingUp': return <TrendingUp size={24} color="#06B6D4" />;
      case 'Clock': return <Clock size={24} color="#F59E0B" />;
      default: return <Sparkles size={24} color="var(--primary)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div 
        style={{ 
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.2rem' }}>
              SubSync Smart Radar
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Algorithmic scanning identified {insights.length} optimization opportunity tips to reduce recurring costs.
            </p>
          </div>
        </div>
      </div>

      <div className="insights-grid">
        {insights.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <CheckCircle2 size={48} color="#10B981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: '800' }}>Your Subscriptions are Fully Optimized!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              No overlapping categories or unused high-cost subscriptions detected.
            </p>
          </div>
        ) : (
          insights.map(item => (
            <div key={item.id} className={`insight-card severity-${item.severity}`}>
              <div style={{ marginTop: '0.2rem' }}>
                {getIcon(item.icon)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer' }}>
                  <span>Review Subscriptions</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
