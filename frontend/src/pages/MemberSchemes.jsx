import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, ShieldAlert, Award, Compass, ExternalLink } from 'lucide-react';

const MemberSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/schemes');
        if (res.data.success) {
          setSchemes(res.data.schemes);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load active government welfare schemes.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading government schemes catalog...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Welfare Schemes & Grants</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Browse state and central welfare policies, subsidies, and educational benefits available for self-help groups</p>

      {error && <div className="text-danger mb-4">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {schemes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No government welfare schemes are currently listed.</p>
        ) : (
          schemes.map((s) => (
            <div key={s._id} className="glass-card hoverable" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0.75rem' }}>
                <div className="flex align-center gap-2">
                  <div style={{ padding: '0.5rem', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <Award size={22} />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>{s.title}</h3>
                </div>
                
                {s.applicationLink && (
                  <a
                    href={s.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', align: 'center', gap: '0.25rem' }}
                  >
                    Apply Now <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {s.description}
              </div>

              <div className="grid-2 mt-2" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--dark-border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Key Subsidy & Benefits</div>
                  <div style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.25rem' }}>{s.benefits}</div>
                </div>
                
                <div style={{ borderLeft: '1px solid var(--dark-border)', paddingLeft: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Eligibility Criteria</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>{s.eligibility}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberSchemes;
