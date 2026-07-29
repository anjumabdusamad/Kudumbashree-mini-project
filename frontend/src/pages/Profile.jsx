import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ShieldAlert, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Name, email, and phone are required fields.');
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setMessage('Profile updated successfully!');
        setFormData(prev => ({ ...prev, password: '' })); // clear password input
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>My Account Profile</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>View and update your contact info and login credentials</p>

      {message && (
        <div className="flex align-center gap-1 mb-4" style={{
          padding: '0.75rem 1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 'var(--radius-sm)',
          color: '#4ade80',
          fontSize: '0.85rem'
        }}>
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex align-center gap-1 mb-4" style={{
          padding: '0.75rem 1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-sm)',
          color: '#ef4444',
          fontSize: '0.85rem'
        }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                name="name"
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Phone size={18} />
              </span>
              <input
                type="tel"
                name="phone"
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">New Password (Leave blank to keep current)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="password"
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter new password (min. 6 chars)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Role / Membership:</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '0.2rem', textTransform: 'capitalize' }}>
              {user.role} - Status: <span style={{ color: user.status === 'approved' ? '#4ade80' : '#facc15' }}>{user.status}</span>
            </div>
            {user.nhg && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Neighborhood Group: {user.nhg.name} (Code: {user.nhg.code})
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving Changes...' : 'Update Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
