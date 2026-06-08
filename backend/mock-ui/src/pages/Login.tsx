import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Package } from 'lucide-react';

export const Login: React.FC = () => {
  const { setUser, setView, showNotification, setLoading, loading } = useApp();
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');

  // Forms
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.login({ username, password });
      const userData = await api.getCurrentUser();
      setUser(userData);
      showNotification('Login successful!', 'success');
      setView(userData.roles?.includes('ROLE_ADMIN') ? 'admin-dashboard' : 'products');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      showNotification(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.signup({
        username: signupUsername,
        password: signupPassword,
        phoneNumber,
        address,
        role: 'ROLE_USER'
      });
      showNotification('Signup successful! Please log in.', 'success');
      setUsername(signupUsername);
      setPassword(signupPassword);
      setIsLoginView(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      showNotification(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(59,130,246,0.15)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Package size={40} color="var(--primary)" />
          </div>
          <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{isLoginView ? 'Sign in to access shop & admin panel' : 'Join our store today'}</p>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {isLoginView ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter username" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
            </div>
            <button type="submit" className="primary" style={{ marginTop: '8px', padding: '14px' }} disabled={loading}>
              {loading ? <span className="loader"></span> : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Username (3-20 chars)</label>
              <input type="text" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required minLength={3} maxLength={20} placeholder="Create username" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Password (6-40 chars)</label>
              <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={6} maxLength={40} placeholder="Create password" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Phone Number (10 digits)</label>
              <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required minLength={10} maxLength={10} pattern="[0-9]{10}" placeholder="0123456789" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Your physical address" />
            </div>
            <button type="submit" className="primary" style={{ marginTop: '8px', padding: '14px' }} disabled={loading}>
              {loading ? <span className="loader"></span> : 'Sign Up'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            className="outline"
            style={{ padding: '4px 8px', border: 'none', color: 'var(--primary)', fontWeight: 'bold' }}
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
            }}
          >
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
