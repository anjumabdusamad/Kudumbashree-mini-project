import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMessage, setErrMessage] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminMode = location.hash === '#admin' || window.location.hash === '#admin' || window.location.hash === '#/admin';

  useEffect(() => {
    if (isAdminMode) {
      setEmail('admin@gmail.com');
      setPassword('adminpassword');
    }
  }, [isAdminMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrMessage('Please fill in all fields');
      return;
    }

    setErrMessage('');
    setLoadingLocal(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } catch (err) {
      setErrMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'var(--dark-bg)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', position: 'relative' }}>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-dark btn-sm"
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            left: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-secondary)'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center mb-4 mt-3">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: isAdminMode 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: '#fff',
            marginBottom: '0.75rem'
          }}>
            {isAdminMode ? <ShieldCheck size={26} /> : 'K'}
          </div>
          {isAdminMode && (
            <div>
              <span className="badge badge-success mb-2" style={{ display: 'inline-block', fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                Admin Access
              </span>
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#fff' }}>
            {isAdminMode ? 'Admin Portal Login' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isAdminMode ? 'Enter credentials to access System Administration' : 'Login to access your Kudumbashree portal'}
          </p>
        </div>

        {errMessage && (
          <div className="flex align-center gap-1 mb-4" style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loadingLocal}
          >
            {loadingLocal ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.85rem',
          textAlign: 'left'
        }}>
          <h4 style={{ color: '#fff', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Demo Credentials:</h4>
          <div style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Admin:</span>
            <div style={{ marginTop: '0.25rem' }}>Email: <code>admin@gmail.com</code></div>
            <div>Password: <code>adminpassword</code></div>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>Member:</span>
            <div style={{ marginTop: '0.25rem' }}>Email: <code>member@gmail.com</code></div>
            <div>Password: <code>memberpassword</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
