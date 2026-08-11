import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { getDaysRemaining, formatCurrency } from '../utils/storage';

export default function RenewalCalendar({ subscriptions, currency, onSimulateEmail }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Previous & Next Month controls
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build Calendar Days Matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      month: month,
      isCurrentMonth: true
    });
  }

  // Next month padding to fill grid to multiple of 7
  const totalSlots = Math.ceil(calendarDays.length / 7) * 7;
  const nextPadding = totalSlots - calendarDays.length;
  for (let n = 1; n <= nextPadding; n++) {
    calendarDays.push({
      day: n,
      month: month + 1,
      isCurrentMonth: false
    });
  }

  // Get subscriptions scheduled on a specific day in this month view
  const getSubsForDay = (dayObj) => {
    if (!dayObj.isCurrentMonth) return [];
    
    // Format YYYY-MM-DD
    const targetMonthStr = String(month + 1).padStart(2, '0');
    const targetDayStr = String(dayObj.day).padStart(2, '0');
    const datePattern = `${year}-${targetMonthStr}-${targetDayStr}`;

    return subscriptions.filter(sub => sub.nextBillingDate === datePattern);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Upcoming items timeline (sorted by renewal date)
  const upcomingTimeline = [...subscriptions]
    .filter(s => s.status === 'active')
    .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
      {/* Main Calendar View */}
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              {monthNames[month]} {year}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-icon-only" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button className="btn-icon-only" onClick={nextMonth} title="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-day-head">{d}</div>
          ))}

          {/* Calendar Slots */}
          {calendarDays.map((slot, index) => {
            const daySubs = getSubsForDay(slot);
            const slotDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(slot.day).padStart(2, '0')}`;
            const isToday = slot.isCurrentMonth && slotDateStr === todayStr;

            return (
              <div 
                key={index} 
                className={`calendar-day-cell ${!slot.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="day-number">{slot.day}</div>

                {daySubs.map(sub => {
                  const catObj = CATEGORIES.find(c => c.id === sub.category) || CATEGORIES[0];
                  return (
                    <div 
                      key={sub.id} 
                      className="calendar-sub-tag" 
                      style={{ background: sub.color || catObj.color }}
                      onClick={() => onSimulateEmail(sub)}
                      title={`${sub.name}: ${formatCurrency(sub.amount, currency)}`}
                    >
                      {sub.name} (${sub.amount})
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Renewal Timeline */}
      <div className="calendar-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Clock size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Renewal Schedule</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {upcomingTimeline.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              No active renewals scheduled.
            </div>
          ) : (
            upcomingTimeline.map(sub => {
              const days = getDaysRemaining(sub.nextBillingDate);
              const catObj = CATEGORIES.find(c => c.id === sub.category) || CATEGORIES[0];

              let badgeColor = '#10B981';
              let badgeText = `In ${days} days`;

              if (days < 0) {
                badgeColor = '#EF4444';
                badgeText = `Overdue (${Math.abs(days)}d)`;
              } else if (days === 0) {
                badgeColor = '#F59E0B';
                badgeText = 'Due Today';
              } else if (days <= 3) {
                badgeColor = '#F97316';
                badgeText = `In ${days} days`;
              }

              return (
                <div 
                  key={sub.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    borderLeft: `4px solid ${sub.color || catObj.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{sub.name}</span>
                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      {formatCurrency(sub.amount, currency)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{sub.nextBillingDate}</span>
                    <span style={{ color: badgeColor, fontWeight: '700', padding: '0.15rem 0.4rem', background: `${badgeColor}15`, borderRadius: '4px' }}>
                      {badgeText}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
