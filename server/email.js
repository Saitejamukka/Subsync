import nodemailer from 'nodemailer';

// Create Nodemailer transport based on env variables or fallback simulator
const getTransporter = async () => {
  // If user provided custom SMTP environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback: Use Ethereal test account for real SMTP email simulation (free test inbox)
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (e) {
    console.warn('⚠️ Could not create Ethereal test mail transport:', e.message);
    return null;
  }
};

export const sendPasswordResetEmail = async (toEmail, pinCode) => {
  console.log(`\n📧 [Email Transport] Preparing password reset email for: ${toEmail}`);
  console.log(`🔐 [Email Transport] Reset PIN Code generated: [ ${pinCode} ] (Expires in 15 minutes)`);

  const mailOptions = {
    from: process.env.SMTP_FROM || '"SubSync Security" <noreply@subsync.app>',
    to: toEmail,
    subject: '🔑 SubSync Password Reset Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #10B981; border-radius: 12px; background: #F4F8F5;">
        <h2 style="color: #047857; margin-bottom: 8px;">⚡ SubSync Password Reset</h2>
        <p style="color: #475569; font-size: 15px;">You requested a password reset for your SubSync account linked to <strong>${toEmail}</strong>.</p>
        
        <div style="background: #FFFFFF; border: 2px dashed #10B981; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-size: 13px; color: #94A3B8; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your 6-Digit Reset Code</span>
          <div style="font-size: 32px; font-weight: 900; color: #047857; letter-spacing: 6px; margin-top: 6px;">${pinCode}</div>
          <span style="font-size: 12px; color: #EF4444; margin-top: 6px; display: block;">Valid for 15 minutes</span>
        </div>

        <p style="color: #64748B; font-size: 13px;">If you did not request this password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid rgba(16,185,129,0.2); margin-top: 24px;" />
        <span style="font-size: 11px; color: #94A3B8;">SubSync - Smart Subscription & Expense Tracker</span>
      </div>
    `
  };

  try {
    const transporter = await getTransporter();
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email dispatched via Nodemailer. Message ID:', info.messageId);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('🔗 [Ethereal Preview URL] View test email in browser:', previewUrl);
        return { sent: true, previewUrl };
      }
    }
  } catch (err) {
    console.error('❌ Failed to dispatch Nodemailer email:', err.message);
  }

  return { sent: false };
};
