import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Users } from 'lucide-react';

const MemberMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/meetings/my-nhg');
        if (res.data.success) {
          setMeetings(res.data.meetings);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch NHG meetings schedules.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.nhg) {
      fetchMeetings();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading meeting calendar...</div>;

  if (!user?.nhg) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem 1rem' }}>
        <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h3>No NHG Unit Assigned</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          You have not been assigned to any Neighborhood Group yet. Please request registration or contact the administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>NHG Meetings & Attendance Logs</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
        View meeting schedules, agenda objectives, and your official attendance status for <strong>{user.nhg.name}</strong>
      </p>

      {error && <div className="text-danger mb-4">{error}</div>}

      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Group Meetings Calendar</h3>
        
        {meetings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No meetings scheduled yet for your group.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Meeting Schedule</th>
                  <th>Agenda / Subject</th>
                  <th>Location</th>
                  <th className="text-center">My Attendance</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => {
                  // Find user attendance status in the meeting's attendance records
                  // The attendance array has objects: { member, status }
                  const myRecord = m.attendance?.find(a => 
                    a.member === user.id || 
                    a.member?._id === user.id || 
                    a.member === user._id || 
                    a.member?._id === user._id
                  );
                  const isPresent = myRecord?.status === 'present';
                  const isAbsent = myRecord?.status === 'absent';
                  
                  return (
                    <tr key={m._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', display: 'flex', align: 'center', gap: '0.4rem' }}>
                          <Calendar size={16} className="text-success" />
                          {new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', align: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <Clock size={14} /> {m.time}
                        </div>
                      </td>
                      <td style={{ maxWidth: '350px', lineHeight: 1.4 }}>
                        {m.agenda}
                      </td>
                      <td>
                        <div style={{ display: 'flex', align: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                          <MapPin size={14} /> {m.venue}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-center">
                          {isPresent ? (
                            <span className="badge badge-success" style={{ display: 'inline-flex', align: 'center', gap: '0.25rem' }}>
                              <CheckCircle size={12} /> Present
                            </span>
                          ) : isAbsent ? (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', align: 'center', gap: '0.25rem' }}>
                              <XCircle size={12} /> Absent
                            </span>
                          ) : (
                            <span className="badge badge-warning" style={{ display: 'inline-flex', align: 'center', gap: '0.25rem' }}>
                              Scheduled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberMeetings;
