import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Calendar, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';

const MemberTrainings = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingRegisterId, setLoadingRegisterId] = useState('');

  const fetchTrainings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/trainings');
      if (res.data.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch training programs catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleRegister = async (trainingId) => {
    setMessage('');
    setError('');
    setLoadingRegisterId(trainingId);

    try {
      const res = await axios.post(`http://localhost:5000/api/trainings/${trainingId}/register`);
      if (res.data.success) {
        setMessage('Successfully registered for the training workshop!');
        fetchTrainings(); // refresh registration arrays
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoadingRegisterId('');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading training catalog...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Skill & Business Trainings</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Register for skill development camps, financial literacy workshops, and vocational seminars</p>

      {message && (
        <div className="flex align-center gap-1 mb-4" style={{
          padding: '0.75rem 1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 'var(--radius-sm)',
          color: '#4ade80',
          fontSize: '0.85rem'
        }}>
          <CheckCircle2 size={18} />
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

      <div className="stats-grid">
        {trainings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No training programs are published at this moment. Check back later.</p>
        ) : (
          trainings.map((t) => {
            // Check if user ID is in the registeredMembers array
            // The member references could be user._id or user.id
            const isRegistered = t.registeredMembers?.some(m => 
              m === user.id || 
              m?._id === user.id || 
              m === user._id || 
              m?._id === user._id
            );
            
            const totalReg = t.registeredMembers?.length || 0;
            const isFull = totalReg >= t.capacity;

            return (
              <div key={t._id} className="glass-card flex" style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', align: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                      <GraduationCap size={20} />
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Vocational Training</span>
                  </div>

                  <h3 className="mb-2" style={{ color: '#fff', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                    {t.title}
                  </h3>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {t.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--dark-border)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div className="flex align-center gap-1">
                      <Calendar size={14} className="text-success" />
                      <span>Date: {new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex align-center gap-1">
                      <MapPin size={14} className="text-success" />
                      <span>Venue: {t.venue}</span>
                    </div>
                    <div className="flex align-center gap-1">
                      <strong>Trainer:</strong>
                      <span>{t.trainer}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between align-center mb-3" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Registered: <strong>{totalReg} / {t.capacity}</strong></span>
                    <span>{t.capacity - totalReg} spots left</span>
                  </div>

                  {isRegistered ? (
                    <button className="btn btn-dark" style={{ width: '100%', cursor: 'default' }} disabled>
                      <CheckCircle2 size={16} className="text-success" /> Registered
                    </button>
                  ) : isFull ? (
                    <button className="btn btn-dark" style={{ width: '100%', cursor: 'not-allowed' }} disabled>
                      Program Full
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => handleRegister(t._id)}
                      disabled={loadingRegisterId === t._id}
                    >
                      {loadingRegisterId === t._id ? 'Registering...' : 'Register for Program'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MemberTrainings;
