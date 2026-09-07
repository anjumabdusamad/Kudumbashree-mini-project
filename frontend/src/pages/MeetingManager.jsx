import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Plus, Users, ShieldAlert, CheckCircle, Clock, MapPin, FileText } from 'lucide-react';
import { generateMeetingReport } from '../utils/pdfGenerator';

const MeetingManager = () => {
  const [nhgs, setNhgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNhgId, setSelectedNhgId] = useState('');
  
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const [formData, setFormData] = useState({ date: '', time: '', venue: '', agenda: '' });
  const [activeMeeting, setActiveMeeting] = useState(null); // Meeting selected for marking attendance
  const [attendanceRecords, setAttendanceRecords] = useState([]); // [{ memberId, status }]

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    const fetchNhgs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/nhgs');
        if (res.data.success) {
          setNhgs(res.data.nhgs);
          if (res.data.nhgs.length > 0) {
            setSelectedNhgId(res.data.nhgs[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch NHG list.');
      } finally {
        setLoading(false);
      }
    };
    fetchNhgs();
  }, []);

  const fetchMeetings = async (nhgId) => {
    if (!nhgId) return;
    setLoadingMeetings(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/meetings/nhg/${nhgId}`);
      if (res.data.success) {
        setMeetings(res.data.meetings);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load meetings list.');
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    if (selectedNhgId) {
      fetchMeetings(selectedNhgId);
      setActiveMeeting(null);
    }
  }, [selectedNhgId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.date || !formData.time || !formData.venue || !formData.agenda) {
      setError('Please fill in all scheduling fields');
      return;
    }

    setLoadingAdd(true);
    try {
      const res = await axios.post('http://localhost:5000/api/meetings', {
        nhgId: selectedNhgId,
        ...formData
      });
      if (res.data.success) {
        setMessage('Meeting scheduled and member notifications broadcasted successfully!');
        setFormData({ date: '', time: '', venue: '', agenda: '' });
        fetchMeetings(selectedNhgId);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setLoadingAdd(false);
    }
  };

  // Select meeting and load attendance
  const handleSelectMeetingForAttendance = async (meeting) => {
    setMessage('');
    setError('');
    
    try {
      const res = await axios.get(`http://localhost:5000/api/meetings/${meeting._id}`);
      if (res.data.success) {
        const fullMeeting = res.data.meeting;
        setActiveMeeting(fullMeeting);
        
        // Map current attendance. Use member._id from populated model
        setAttendanceRecords(
          fullMeeting.attendance.map((att) => ({
            memberId: att.member?._id,
            status: att.status,
            name: att.member?.name || 'Unknown Member'
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load meeting attendance details.');
    }
  };

  const handleToggleAttendance = (memberId, newStatus) => {
    setAttendanceRecords(prev =>
      prev.map((rec) => (rec.memberId === memberId ? { ...rec, status: newStatus } : rec))
    );
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoadingAttendance(true);

    try {
      const res = await axios.put(`http://localhost:5000/api/meetings/${activeMeeting._id}/attendance`, {
        attendanceRecords: attendanceRecords.map(r => ({ memberId: r.memberId, status: r.status }))
      });

      if (res.data.success) {
        setMessage('Meeting attendance records updated successfully!');
        setActiveMeeting(null);
        fetchMeetings(selectedNhgId);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setLoadingAttendance(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Meeting Scheduler...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Meeting & Attendance Manager</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Schedule unit meetings and record member attendance sheets</p>

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

      {/* Select NHG Unit Dropdown */}
      <div className="glass-card mb-4">
        <label className="form-label" style={{ fontWeight: 600 }}>Configure for NHG Unit:</label>
        {nhgs.length === 0 ? (
          <p className="text-danger">No active NHG units found in system. Register a group first.</p>
        ) : (
          <select
            className="form-control form-select"
            value={selectedNhgId}
            onChange={(e) => setSelectedNhgId(e.target.value)}
          >
            {nhgs.map((nhg) => (
              <option key={nhg._id} value={nhg._id}>
                {nhg.name} ({nhg.location})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid-2 mb-4">
        {/* Schedule form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Schedule New Meeting</h3>
          <form onSubmit={handleScheduleMeeting}>
            <div className="form-group">
              <label className="form-label">Meeting Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Time</label>
              <input
                type="time"
                name="time"
                className="form-control"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Venue (Meeting Place)</label>
              <input
                type="text"
                name="venue"
                className="form-control"
                placeholder="E.g., NHG President's House"
                value={formData.venue}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Meeting Agenda</label>
              <textarea
                name="agenda"
                rows="3"
                className="form-control"
                placeholder="E.g., Financial budget review, handicraft training program planning..."
                value={formData.agenda}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingAdd || !selectedNhgId}>
              <Plus size={18} /> {loadingAdd ? 'Scheduling...' : 'Post Meeting Schedule'}
            </button>
          </form>
        </div>

        {/* Attendance recording interface */}
        {activeMeeting ? (
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 className="mb-2" style={{ fontSize: '1.25rem' }}>Mark Attendance Sheets</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-3">
              <strong>Agenda:</strong> {activeMeeting.agenda}
            </p>

            <form onSubmit={handleSaveAttendance}>
              <div className="table-container mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Member Name</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No approved members found in this group.</td>
                      </tr>
                    ) : (
                      attendanceRecords.map((record) => (
                        <tr key={record.memberId}>
                          <td style={{ fontWeight: 600 }}>{record.name}</td>
                          <td className="text-center">
                            <input
                              type="radio"
                              name={`attendance-${record.memberId}`}
                              checked={record.status === 'present'}
                              onChange={() => handleToggleAttendance(record.memberId, 'present')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="radio"
                              name={`attendance-${record.memberId}`}
                              checked={record.status === 'absent'}
                              onChange={() => handleToggleAttendance(record.memberId, 'absent')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#dc2626' }}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-dark" style={{ flex: 1 }} onClick={() => setActiveMeeting(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loadingAttendance}>
                  {loadingAttendance ? 'Saving Attendance...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="glass-card flex align-center justify-center text-center" style={{ minHeight: '300px' }}>
            <div>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Select a meeting from the schedule index below to register/edit attendance sheets.</p>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Index List */}
      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Scheduled Meetings Calendar</h3>
        {loadingMeetings ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading meetings list...</p>
        ) : meetings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No meetings scheduled yet for this unit.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Meeting Details</th>
                  <th>Agenda / Objective</th>
                  <th>Attendance Statistics</th>
                  <th className="text-center">Sheet Action</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => {
                  const presentCount = meeting.attendance.filter(a => a.status === 'present').length;
                  const totalCount = meeting.attendance.length;
                  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                  
                  return (
                    <tr key={meeting._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', align: 'center', gap: '0.4rem' }}>
                            <Calendar size={16} className="text-success" />
                            {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', align: 'center', gap: '0.4rem' }}>
                            <Clock size={14} /> {meeting.time}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', align: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} /> {meeting.venue}
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', lineHeight: 1.4 }}>{meeting.agenda}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {presentCount} / {totalCount} Present ({attendanceRate}%)
                          </div>
                          <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.25rem', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--primary)', width: `${attendanceRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-center gap-1">
                          <button
                            className="btn btn-dark btn-sm flex align-center gap-1"
                            onClick={() => generateMeetingReport(meeting)}
                            title="Download PDF Minutes"
                            style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}
                          >
                            <FileText size={14} />
                            <span>PDF</span>
                          </button>
                          <button className="btn btn-dark btn-sm" onClick={() => handleSelectMeetingForAttendance(meeting)}>
                            Record Attendance
                          </button>
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

export default MeetingManager;
