import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerUser(formData.name, formData.email, formData.password);
      } else {
        data = await loginUser(formData.email, formData.password);
      }

      if (data && data.user) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data?.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="var(--green-primary)" />
            <h2 className="modal-title">
              {isRegister ? 'Create SubSync Account' : 'Sign In to SubSync'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'var(--accent-red-bg)', 
              color: '#B91C1C', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              minLength={4}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Free Account' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button 
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--green-dark)', fontWeight: '800', cursor: 'pointer' }}
                onClick={() => { setIsRegister(false); setError(''); }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button 
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--green-dark)', fontWeight: '800', cursor: 'pointer' }}
                onClick={() => { setIsRegister(true); setError(''); }}
              >
                Register Now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
