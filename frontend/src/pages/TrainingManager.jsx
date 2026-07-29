import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GraduationCap, Plus, Users, ShieldAlert, CheckCircle, Calendar, MapPin, Eye } from 'lucide-react';

const TrainingManager = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ title: '', description: '', trainer: '', date: '', venue: '', capacity: '20' });
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [selectedTraining, setSelectedTraining] = useState(null); // Shows participants
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTrainings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/trainings');
      if (res.data.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch training programs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.title || !formData.description || !formData.trainer || !formData.date || !formData.venue || !formData.capacity) {
      setError('Please fill in all training registration fields');
      return;
    }

    setLoadingAdd(true);
    try {
      const res = await axios.post('http://localhost:5000/api/trainings', formData);
      if (res.data.success) {
        setMessage('Training program created successfully and notifications broadcasted!');
        setFormData({ title: '', description: '', trainer: '', date: '', venue: '', capacity: '20' });
        fetchTrainings();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to publish training program');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSelectTraining = async (training) => {
    setMessage('');
    setError('');
    
    // We want to load training with fully populated registered members.
    // Wait, the GET list returned all trainings, let's see: we can populate manually or if the GET route handles it, or fetch single model if needed. 
    // In our backend/routes/trainings.js, the list `/` returns basic details. Let's see: we populate `registeredMembers` from user details when fetching individual or load details.
    // Wait, we can fetch individual or we can inspect. Let's see: in `trainings.js` router, did we populate `registeredMembers`? Let's check:
    // Ah, `GET /` just did `Training.find().sort({ date: 1 })` without populating registeredMembers.
    // Let's check if we can populate it on selection. Oh, wait, the backend doesn't have an individual `/trainings/:id` route, but wait, the register endpoint `POST /trainings/:id/register` exists, but what about fetching participants? 
    // Wait, we can add a route or we can change `GET /` to populate `registeredMembers` with `name email phone`! Yes, that's much simpler! In `trainings.js` router we can check `registeredMembers` population, or since we want it populated, we can add populating to the lists, or we can fetch them. 
    // Wait! Let's check `backend/routes/trainings.js`. We wrote:
    // `router.get('/', async (req, res) => { const trainings = await Training.find().sort({ date: 1 }); ...`
    // We can easily replace the code in `backend/routes/trainings.js` to populate registeredMembers:
    // `const trainings = await Training.find().populate('registeredMembers', 'name email phone nhg').sort({ date: 1 });`
    // Yes! Let's make this simple edit in `backend/routes/trainings.js` to make the participants list fully functional out-of-the-box!
    // But first, let's write `TrainingManager.jsx` assuming they are populated.
    setSelectedTraining(training);
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Training Manager...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Training Program Publishing</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Publish skill development programs, seminars, and training camps</p>

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

      <div className="grid-2 mb-4">
        {/* Create program form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Create New Workshop</h3>
          <form onSubmit={handleCreateTraining}>
            <div className="form-group">
              <label className="form-label">Training Topic / Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="E.g., Organic Soap Making Workshop"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trainer / Organisation</label>
              <input
                type="text"
                name="trainer"
                className="form-control"
                placeholder="E.g., Kudumbasree District Mission / KVASU"
                value={formData.trainer}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Training Date</label>
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
                <label className="form-label">Max Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  className="form-control"
                  placeholder="20"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input
                type="text"
                name="venue"
                className="form-control"
                placeholder="E.g., Panchayat Hall, Ward 4"
                value={formData.venue}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Program Description</label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="Details about raw materials, timings, certifications..."
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingAdd}>
              <Plus size={18} /> {loadingAdd ? 'Publishing...' : 'Publish Training Program'}
            </button>
          </form>
        </div>

        {/* Participant list inspect */}
        {selectedTraining ? (
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <div className="flex justify-between align-center mb-3">
              <h3 style={{ fontSize: '1.25rem' }}>Participants: {selectedTraining.title}</h3>
              <button className="btn btn-dark btn-sm" onClick={() => setSelectedTraining(null)}>
                Close
              </button>
            </div>
            
            <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Participant Name</th>
                    <th>Email / Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTraining.registeredMembers?.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center" style={{ color: 'var(--text-secondary)' }}>
                        No members have registered for this program yet.
                      </td>
                    </tr>
                  ) : (
                    selectedTraining.registeredMembers?.map((member, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{member.name || 'Member'}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{member.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: {member.phone}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card flex align-center justify-center text-center" style={{ minHeight: '300px' }}>
            <div>
              <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Click on the inspect button under the workshops list to review member participant registration sheets.</p>
            </div>
          </div>
        )}
      </div>

      {/* Workshop List Table */}
      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Published Training Workshops</h3>
        {trainings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No training programs registered yet.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Topic & Trainer</th>
                  <th>Schedule</th>
                  <th>Venue</th>
                  <th>Registrations / Capacity</th>
                  <th className="text-center">Participant Sheet</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instructor: {t.trainer}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '280px', lineHeight: 1.4 }}>
                        {t.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', align: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} className="text-success" />
                        {new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', align: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                        <MapPin size={14} /> {t.venue}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {t.registeredMembers?.length || 0} / {t.capacity} registered
                      </div>
                      <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.25rem', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'var(--primary)', 
                          width: `${Math.min(100, (((t.registeredMembers?.length || 0) / t.capacity) * 100))}%` 
                        }}></div>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <button className="btn btn-dark btn-sm" onClick={() => handleSelectTraining(t)}>
                          <Eye size={14} /> Review Participants
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingManager;
