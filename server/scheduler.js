import cron from 'node-cron';
import { query } from './db.js';

export const checkUpcomingRenewals = async () => {
  console.log('⏰ [Cron Scheduler] Executing automated daily subscription renewal audit...');
  
  try {
    const activeSubs = await query(`SELECT * FROM subscriptions WHERE status = 'active'`);
    const today = new Date();
    today.setHours(0,0,0,0);

    const alertsTriggered = [];

    activeSubs.forEach(sub => {
      const billingDate = new Date(sub.nextBillingDate + 'T00:00:00');
      billingDate.setHours(0,0,0,0);

      const diffTime = billingDate - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const reminderThreshold = sub.reminderDays || 3;

      if (daysRemaining <= reminderThreshold) {
        const isOverdue = daysRemaining < 0;
        const isToday = daysRemaining === 0;

        alertsTriggered.push({
          id: sub.id,
          name: sub.name,
          amount: sub.amount,
          nextBillingDate: sub.nextBillingDate,
          daysRemaining,
          statusMessage: isOverdue 
            ? `OVERDUE by ${Math.abs(daysRemaining)} days!` 
            : isToday 
            ? `DUE TODAY!` 
            : `Due in ${daysRemaining} days (Threshold: ${reminderThreshold}d)`
        });
      }
    });

    if (alertsTriggered.length > 0) {
      console.log(`🔔 [Cron Scheduler] ${alertsTriggered.length} Renewal Alerts Triggered:`);
      alertsTriggered.forEach(alert => {
        console.log(`   - [${alert.name}] $${alert.amount} on ${alert.nextBillingDate} -> ${alert.statusMessage}`);
      });
    } else {
      console.log('✅ [Cron Scheduler] No upcoming renewals within reminder thresholds today.');
    }

    return alertsTriggered;
  } catch (err) {
    console.error('❌ [Cron Scheduler] Error running renewal check:', err.message);
    return [];
  }
};

// Start background cron job (runs every midnight 00:00)
export const initScheduler = () => {
  cron.schedule('0 0 * * *', () => {
    checkUpcomingRenewals();
  });
  console.log('⚙️ Background renewal cron scheduler registered (runs daily at 00:00).');
};
