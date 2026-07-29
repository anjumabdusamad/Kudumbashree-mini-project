import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Check, ShieldAlert, CheckCircle, Eye } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setMessage('');
    setError('');
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    try {
      // Send parallel read requests
      await Promise.all(
        unread.map(n => axios.put(`http://localhost:5000/api/notifications/${n._id}/read`))
      );
      setMessage('All notifications marked as read.');
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setError('Failed to mark notifications as read.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading notifications...</div>;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="flex justify-between align-center mb-4">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Notifications Inbox</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Receive direct communications, meeting logs, and subsidy details from administrators</p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '3rem' }}>
            <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Your inbox is empty.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className="glass-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1.5rem',
                background: n.isRead ? 'var(--glass-bg)' : 'rgba(22, 163, 74, 0.04)',
                border: n.isRead ? '1px solid var(--glass-border)' : '1px solid rgba(22, 163, 74, 0.18)',
                boxShadow: n.isRead ? 'var(--glass-shadow)' : '0 8px 32px 0 rgba(22, 163, 74, 0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <div className="flex align-center gap-2 mb-2">
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: n.isRead ? 'transparent' : 'var(--primary)',
                    display: 'inline-block'
                  }}></span>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, paddingLeft: '1rem' }}>
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <button
                  className="btn btn-dark btn-sm"
                  style={{ padding: '0.4rem', flexShrink: 0 }}
                  onClick={() => handleMarkAsRead(n._id)}
                  title="Mark as read"
                >
                  <Check size={16} className="text-success" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
