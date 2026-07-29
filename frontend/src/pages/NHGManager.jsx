import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Users, ShieldAlert, CheckCircle, Trash2, Edit } from 'lucide-react';

const NHGManager = () => {
  const [nhgs, setNhgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', code: '', location: '' });
  
  const [selectedNhg, setSelectedNhg] = useState(null);
  const [leaderData, setLeaderData] = useState({ presidentId: '', secretaryId: '', treasurerId: '' });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const fetchNhgs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/nhgs');
      if (res.data.success) {
        setNhgs(res.data.nhgs);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch NHG list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNhgs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNhg = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.name || !formData.code || !formData.location) {
      setError('Please fill in all fields');
      return;
    }

    setLoadingAdd(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/nhgs', formData);
      if (res.data.success) {
        setMessage('NHG Unit created successfully!');
        setFormData({ name: '', code: '', location: '' });
        fetchNhgs();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create NHG unit');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSelectNhg = (nhg) => {
    setSelectedNhg(nhg);
    setLeaderData({
      presidentId: nhg.president?._id || '',
      secretaryId: nhg.secretary?._id || '',
      treasurerId: nhg.treasurer?._id || '',
    });
  };

  const handleLeaderChange = (e) => {
    const { name, value } = e.target;
    setLeaderData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateLeaders = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoadingUpdate(true);

    try {
      const res = await axios.put(`http://localhost:5000/api/admin/nhgs/${selectedNhg._id}`, {
        presidentId: leaderData.presidentId || null,
        secretaryId: leaderData.secretaryId || null,
        treasurerId: leaderData.treasurerId || null,
      });

      if (res.data.success) {
        setMessage(`Successfully updated leaders for NHG: ${selectedNhg.name}`);
        setSelectedNhg(res.data.nhg);
        fetchNhgs();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update leadership assignments');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDeleteNhg = async (nhgId) => {
    if (!window.confirm('Are you sure you want to delete this NHG? Members associated with it will have their NHG cleared.')) {
      return;
    }

    setMessage('');
    setError('');

    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/nhgs/${nhgId}`);
      if (res.data.success) {
        setMessage('NHG unit deleted successfully!');
        setSelectedNhg(null);
        fetchNhgs();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete NHG unit.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Neighborhood Groups...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>NHG Group Management</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Create Neighborhood Groups (Ayalkootams) and assign roles</p>

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
        {/* NHG Creation form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Create New NHG Unit</h3>
          <form onSubmit={handleAddNhg}>
            <div className="form-group">
              <label className="form-label">NHG Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="E.g., Kairali Ayalkootam"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">NHG Code</label>
              <input
                type="text"
                name="code"
                className="form-control"
                placeholder="Unique code (e.g. NHG101)"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Location (Ward/Place)</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="E.g., Ward 4, Trivandrum"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingAdd}>
              <Plus size={18} /> {loadingAdd ? 'Creating...' : 'Register NHG'}
            </button>
          </form>
        </div>

        {/* Selected NHG Leadership assignments */}
        {selectedNhg ? (
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <div className="flex justify-between align-center mb-3">
              <h3 style={{ fontSize: '1.25rem' }}>Assign Leaders: {selectedNhg.name}</h3>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNhg(selectedNhg._id)}>
                <Trash2 size={16} /> Delete NHG
              </button>
            </div>
            
            <form onSubmit={handleUpdateLeaders}>
              {/* Select President */}
              <div className="form-group">
                <label className="form-label">President (Member)</label>
                <select
                  name="presidentId"
                  className="form-control form-select"
                  value={leaderData.presidentId}
                  onChange={handleLeaderChange}
                >
                  <option value="">-- No President Selected --</option>
                  {selectedNhg.members
                    .filter(m => m.status === 'approved')
                    .map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                </select>
              </div>

              {/* Select Secretary */}
              <div className="form-group">
                <label className="form-label">Secretary (Member)</label>
                <select
                  name="secretaryId"
                  className="form-control form-select"
                  value={leaderData.secretaryId}
                  onChange={handleLeaderChange}
                >
                  <option value="">-- No Secretary Selected --</option>
                  {selectedNhg.members
                    .filter(m => m.status === 'approved')
                    .map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                </select>
              </div>

              {/* Select Treasurer */}
              <div className="form-group mb-4">
                <label className="form-label">Treasurer (Member)</label>
                <select
                  name="treasurerId"
                  className="form-control form-select"
                  value={leaderData.treasurerId}
                  onChange={handleLeaderChange}
                >
                  <option value="">-- No Treasurer Selected --</option>
                  {selectedNhg.members
                    .filter(m => m.status === 'approved')
                    .map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-dark" style={{ flex: 1 }} onClick={() => setSelectedNhg(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loadingUpdate}>
                  {loadingUpdate ? 'Saving...' : 'Save Assignments'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="glass-card flex align-center justify-center text-center" style={{ minHeight: '300px' }}>
            <div>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Select an NHG unit from the list to assign roles (President, Secretary, Treasurer) or manage properties.</p>
            </div>
          </div>
        )}
      </div>

      {/* List of existing NHGs */}
      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Active NHG Directory</h3>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>NHG Group Info</th>
                <th>Location</th>
                <th>Leadership Committee</th>
                <th>Total Members</th>
                <th className="text-center">Configure</th>
              </tr>
            </thead>
            <tbody>
              {nhgs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    No NHG units registered yet. Complete the form above to add your first unit.
                  </td>
                </tr>
              ) : (
                nhgs.map((nhg) => (
                  <tr key={nhg._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{nhg.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: <code>{nhg.code}</code></div>
                    </td>
                    <td>{nhg.location}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <div><strong style={{ color: 'var(--secondary)' }}>President:</strong> {nhg.president?.name || 'Unassigned'}</div>
                        <div><strong style={{ color: 'var(--secondary)' }}>Secretary:</strong> {nhg.secretary?.name || 'Unassigned'}</div>
                        <div><strong style={{ color: 'var(--secondary)' }}>Treasurer:</strong> {nhg.treasurer?.name || 'Unassigned'}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{nhg.members?.length || 0} Members</td>
                    <td>
                      <div className="flex justify-center">
                        <button className="btn btn-dark btn-sm" onClick={() => handleSelectNhg(nhg)}>
                          <Edit size={14} /> Edit & Leadership
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NHGManager;
