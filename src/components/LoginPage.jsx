import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Eye, 
  EyeOff, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Bell,
  KeyRound
} from 'lucide-react';
import { loginUser, registerUser, requestForgotPassword, resetPasswordWithToken } from '../services/api';

export default function LoginPage({ isOpen, onClose, onAuthSuccess, initialIsRegister = false }) {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: true
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password sub-state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Request code, 2: Enter code & reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoPinCode, setDemoPinCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Basic Validation
    if (isRegister && !formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerUser(formData.name.trim(), formData.email.trim(), formData.password);
      } else {
        data = await loginUser(formData.email.trim(), formData.password);
      }

      if (data && data.user) {
        setSuccessMsg(isRegister ? 'Account created successfully! Logging you in...' : 'Sign in successful!');
        setTimeout(() => {
          onAuthSuccess(data.user);
          if (onClose) onClose();
        }, 500);
      } else {
        setError(data?.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    setError('');
    setSuccessMsg(`Simulating ${provider} OAuth authentication...`);
    setTimeout(() => {
      // Demo mock user payload for smooth testing experience
      const mockUser = {
        id: `oauth-${Date.now()}`,
        name: provider === 'Google' ? 'Alex Rivera (Google)' : 'Alex Rivera (GitHub)',
        email: `alex.${provider.toLowerCase()}@example.com`
      };
      setSuccessMsg(`Authenticated via ${provider}! Redirecting...`);
      setTimeout(() => {
        onAuthSuccess(mockUser);
        if (onClose) onClose();
      }, 600);
    }, 800);
  };

  const handleGuestLogin = () => {
    setError('');
    setSuccessMsg('Entering SubSync in Demo Mode...');
    setTimeout(() => {
      const guestUser = {
        id: 'guest-demo-user',
        name: 'Demo Guest',
        email: 'demo@subsync.app'
      };
      onAuthSuccess(guestUser);
      if (onClose) onClose();
    }, 400);
  };

  // Step 1: Request Password Reset Code
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter a valid email address for password reset.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestForgotPassword(forgotEmail.trim());
      if (res && !res.error) {
        setDemoPinCode(res.demoCode || '');
        setPreviewUrl(res.previewUrl || '');
        setForgotStep(2);
        setSuccessMsg(res.message || 'Verification PIN code sent to your email.');
      } else {
        setError(res?.error || 'Failed to send reset code. Please verify your email.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred sending reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Reset Code & Set New Password
  const handleResetPasswordConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetToken || resetToken.trim().length !== 6) {
      setError('Please enter the 6-digit verification PIN code.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithToken(forgotEmail.trim(), resetToken.trim(), newPassword);
      if (res && !res.error) {
        setSuccessMsg(res.message || 'Password reset successfully!');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotStep(1);
          setFormData(prev => ({ ...prev, email: forgotEmail, password: newPassword }));
          setError('');
        }, 1200);
      } else {
        setError(res?.error || 'Failed to reset password. Please check your code.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {onClose && (
          <button className="login-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        )}

        {/* Split Layout: Left Hero Panel */}
        <div className="login-hero-panel">
          <div className="login-hero-content">
            <div className="login-brand">
              <div className="login-brand-icon">
                <Zap size={28} color="#FFFFFF" />
              </div>
              <span className="login-brand-text">SubSync</span>
            </div>

            <h1 className="login-hero-title">
              Take complete control of your recurring subscriptions.
            </h1>
            
            <p className="login-hero-subtitle">
              Join thousands of smart spenders who optimize recurring bills, catch hidden renewals, and save hundreds every year.
            </p>

            {/* Feature List */}
            <div className="login-feature-list">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <TrendingUp size={18} color="var(--green-primary)" />
                </div>
                <div>
                  <h4>Real-time Spend Analytics</h4>
                  <p>Visualize monthly trends and category breakdowns with instant Chart.js insights.</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <Bell size={18} color="var(--accent-amber)" />
                </div>
                <div>
                  <h4>Automated Renewal Radar</h4>
                  <p>Never get surprised by an auto-renew bill again with smart cron alerts.</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <Sparkles size={18} color="#8B5CF6" />
                </div>
                <div>
                  <h4>Smart Cost Optimization</h4>
                  <p>Algorithmic suggestions for annual discounts and redundant plan consolidation.</p>
                </div>
              </div>
            </div>

            {/* Social Proof / Stats Badge */}
            <div className="login-testimonial-badge">
              <div className="login-badge-avatar-group">
                <div className="avatar-chip">JD</div>
                <div className="avatar-chip accent-bg">AR</div>
                <div className="avatar-chip dark-bg">SK</div>
              </div>
              <div className="login-badge-text">
                <strong>Average $340/yr saved</strong> per active user session
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          {/* Header */}
          <div className="login-form-header">
            <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {isRegister 
                ? 'Start tracking and saving on subscriptions in under 60 seconds.' 
                : 'Enter your credentials to access your subscription dashboard.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="login-tab-pill">
            <button 
              type="button"
              className={`login-tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`login-tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="login-alert error">
              <ShieldCheck size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-alert success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Auth Form */}
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="login-form">
              {isRegister && (
                <div className="login-input-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="login-input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      id="reg-name"
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="login-input-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="login-input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input 
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <div className="login-label-row">
                  <label htmlFor="login-password">Password</label>
                  {!isRegister && (
                    <button 
                      type="button" 
                      className="forgot-pass-link"
                      onClick={() => { setShowForgotPassword(true); setError(''); setSuccessMsg(''); }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="login-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    minLength={4}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator for Registration */}
              {isRegister && formData.password.length > 0 && (
                <div className="password-strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: formData.password.length > 8 ? '100%' : formData.password.length > 5 ? '66%' : '33%',
                      backgroundColor: formData.password.length > 8 ? '#10B981' : formData.password.length > 5 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                  <span className="strength-label">
                    {formData.password.length > 8 ? 'Strong password' : formData.password.length > 5 ? 'Moderate password' : 'Weak password'}
                  </span>
                </div>
              )}

              {/* Checkbox */}
              <div className="login-remember-row">
                <label className="checkbox-container">
                  <input 
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-text">Keep me signed in on this browser</span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading}
              >
                <span>{loading ? 'Authenticating...' : isRegister ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
                <ArrowRight size={18} />
              </button>

              {/* Social Login Separator */}
              <div className="login-divider">
                <span>or continue with</span>
              </div>

              {/* Social OAuth Buttons */}
              <div className="social-oauth-grid">
                <button 
                  type="button" 
                  className="social-btn"
                  onClick={() => handleSocialAuth('Google')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button 
                  type="button" 
                  className="social-btn"
                  onClick={() => handleSocialAuth('GitHub')}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Demo Mode Direct Gateway Button */}
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleGuestLogin}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', padding: '0.65rem', fontWeight: '700', borderRadius: '12px' }}
              >
                <span>⚡ Continue as Guest (Demo Mode)</span>
              </button>
            </form>
          ) : (
            /* Forgot Password Sub-View */
            <div className="forgot-password-view">
              {!forgotSubmitted ? (
                <form onSubmit={handleForgotPasswordSubmit} className="login-form">
                  <div className="forgot-header">
                    <KeyRound size={32} color="var(--green-primary)" style={{ marginBottom: '0.5rem' }} />
                    <h3>Reset your password</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Enter your account email and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <div className="login-input-group" style={{ marginTop: '1rem' }}>
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="login-input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input 
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="login-submit-btn" style={{ marginTop: '1rem' }}>
                    <span>Send Reset Instructions</span>
                    <ArrowRight size={18} />
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                    onClick={() => { setShowForgotPassword(false); setError(''); }}
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <div className="forgot-success-box">
                  <CheckCircle2 size={40} color="var(--green-primary)" />
                  <h3>Check your inbox</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    We've sent a password reset link to <strong>{forgotEmail}</strong>.
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }}
                    onClick={() => { setShowForgotPassword(false); setForgotSubmitted(false); }}
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Terms Note */}
          <div className="login-footer-terms">
            By continuing, you agree to SubSync's Terms of Service and Privacy Policy. Protected by 256-bit SSL encryption.
          </div>
        </div>
      </div>
    </div>
  );
}
