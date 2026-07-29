import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Plus, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';

const SchemeManager = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ title: '', description: '', eligibility: '', benefits: '', applicationLink: '' });
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSchemes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/schemes');
      if (res.data.success) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch welfare schemes list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.title || !formData.description || !formData.eligibility || !formData.benefits) {
      setError('Please fill in all required scheme fields');
      return;
    }

    setLoadingAdd(true);
    try {
      const res = await axios.post('http://localhost:5000/api/schemes', formData);
      if (res.data.success) {
        setMessage('Welfare scheme published successfully! Member alerts broadcasted.');
        setFormData({ title: '', description: '', eligibility: '', benefits: '', applicationLink: '' });
        fetchSchemes();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to publish scheme');
    } finally {
      setLoadingAdd(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Welfare Scheme Manager...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Government Schemes & Welfare</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Publish financial subsidy details, welfare schemes, and direct benefits eligibility updates</p>

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
        {/* Create scheme form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Publish New Welfare Scheme</h3>
          <form onSubmit={handleCreateScheme}>
            <div className="form-group">
              <label className="form-label">Scheme Title / Name</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="E.g., Kudumbashree Micro-Enterprise Subsidy"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subsidies / Benefits Details</label>
              <input
                type="text"
                name="benefits"
                className="form-control"
                placeholder="E.g., 50% capital subsidy up to ₹50,000 for startup units"
                value={formData.benefits}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Eligibility Criteria</label>
              <input
                type="text"
                name="eligibility"
                className="form-control"
                placeholder="E.g., Approved NHG unit with minimum 1 year active status"
                value={formData.eligibility}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Link (Optional)</label>
              <input
                type="url"
                name="applicationLink"
                className="form-control"
                placeholder="https://kudumbashree.org/schemes/..."
                value={formData.applicationLink}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Scheme Description</label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="Detailed explanations regarding application procedures, document audits, and deadlines..."
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingAdd}>
              <Plus size={18} /> {loadingAdd ? 'Publishing...' : 'Publish Scheme'}
            </button>
          </form>
        </div>

        {/* Info card display */}
        <div className="glass-card flex align-center justify-center text-center" style={{ minHeight: '300px' }}>
          <div>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Log new central/state welfare announcements on the left. Published schemes are visible in the index below and on member portals instantly.</p>
          </div>
        </div>
      </div>

      {/* Welfare Schemes list table */}
      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Active Government & Subsidy Schemes</h3>
        {schemes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No welfare schemes published yet.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Scheme Name & Details</th>
                  <th>Key Benefits</th>
                  <th>Eligibility Criteria</th>
                  <th className="text-center">Reference Link</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{s.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '350px', lineHeight: 1.4 }}>
                        {s.description}
                      </div>
                    </td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{s.benefits}</td>
                    <td>{s.eligibility}</td>
                    <td>
                      <div className="flex justify-center">
                        {s.applicationLink ? (
                          <a
                            href={s.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-dark btn-sm"
                            style={{ display: 'inline-flex', align: 'center', gap: '0.25rem' }}
                          >
                            Visit Site <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None provided</span>
                        )}
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

export default SchemeManager;
