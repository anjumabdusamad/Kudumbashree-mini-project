import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCheck, UserX, UserMinus, ShieldAlert, CheckCircle, UserPlus, Mail, Phone, Lock } from 'lucide-react';

const MemberApproval = () => {
  const [users, setUsers] = useState([]);
  const [nhgs, setNhgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Manual Add Form State
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    nhgId: '',
  });
  const [loadingAdd, setLoadingAdd] = useState(false);

  const fetchPendingMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users?status=pending');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending member registrations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNhgs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/nhgs');
      if (res.data.success) {
        setNhgs(res.data.nhgs);
        if (res.data.nhgs.length > 0) {
          setAddForm(prev => ({ ...prev, nhgId: res.data.nhgs[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
    fetchNhgs();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    setMessage('');
    setError('');
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        setMessage(`Successfully ${newStatus === 'approved' ? 'approved' : 'rejected'} user registration!`);
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.password) {
      setError('Please fill in all details to create a member account.');
      return;
    }

    setLoadingAdd(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/members/create', addForm);
      if (res.data.success) {
        setMessage(`Member account created successfully! Credentials provided: Email: ${addForm.email}, Password: ${addForm.password}.`);
        setAddForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          nhgId: nhgs.length > 0 ? nhgs[0]._id : '',
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create member account.');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading registration portal...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Member Management</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Add new members manually or approve self-registered user accounts</p>

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

      <div className="grid-3 mb-4">
        {/* Left Form: Create Member Account */}
        <div className="glass-card" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} style={{ color: 'var(--primary)' }} />
            Add Member Manually
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Create a pre-approved, verified member account directly.
          </p>

          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="E.g., Radha Devi"
                value={addForm.name}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="radha@gmail.com"
                value={addForm.email}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="10-digit number"
                value={addForm.phone}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={addForm.password}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assign NHG Unit</label>
              {nhgs.length === 0 ? (
                <small className="text-danger" style={{ display: 'block', margin: '0.25rem 0' }}>No NHG units created yet</small>
              ) : (
                <select
                  name="nhgId"
                  className="form-control form-select"
                  value={addForm.nhgId}
                  onChange={handleFormChange}
                  required
                >
                  {nhgs.map((nhg) => (
                    <option key={nhg._id} value={nhg._id}>
                      {nhg.name} ({nhg.location})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loadingAdd || nhgs.length === 0}
            >
              {loadingAdd ? 'Creating...' : 'Create Member Account'}
            </button>
          </form>
        </div>

        {/* Right Table: Pending Applications */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Pending Applications</h3>
          
          {users.length === 0 ? (
            <div className="text-center" style={{ padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
              <UserMinus size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No pending registrations to review. All caught up!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Selected NHG</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => (
                    <tr key={member._id}>
                      <td style={{ fontWeight: 600 }}>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.phone}</td>
                      <td>
                        {member.nhg ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{member.nhg.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {member.nhg.code}</div>
                          </div>
                        ) : (
                          <span className="text-danger">None Assigned</span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-center gap-1">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(member._id, 'approved')}
                            title="Approve Member"
                          >
                            <UserCheck size={16} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateStatus(member._id, 'rejected')}
                            title="Reject Member"
                          >
                            <UserX size={16} /> Reject
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
    </div>
  );
};

export default MemberApproval;
