import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Landmark, CreditCard, Layers, Printer, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Panel...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  const { summary, savingsByNhg } = reports;

  return (
    <div>
      <div className="flex justify-between align-center mb-4 printable-hide">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Administration Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Kudumbashree Central Management & Reports Panel</p>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Print Full Report
        </button>
      </div>

      {/* Printable Report Header */}
      <div className="printable-show" style={{ display: 'none', marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#000', fontSize: '2.5rem', fontWeight: 800 }}>KUDUMBASHREE MANAGEMENT SYSTEM</h1>
        <h3 style={{ color: '#555' }}>Official Administrative & Financial Summary Report</h3>
        <p style={{ color: '#777', fontSize: '0.85rem' }}>Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Total NHG Units</p>
            <h3>{summary.totalNHGs}</h3>
          </div>
          <div className="stat-icon" style={{ color: '#60a5fa' }}><Layers size={24} /></div>
        </div>

        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Approved Members</p>
            <h3>{summary.totalMembers}</h3>
            {summary.pendingMembers > 0 && (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                {summary.pendingMembers} pending review
              </span>
            )}
          </div>
          <div className="stat-icon" style={{ color: '#4ade80' }}><Users size={24} /></div>
        </div>

        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Accumulated Savings</p>
            <h3>₹{summary.totalSavings.toLocaleString('en-IN')}</h3>
          </div>
          <div className="stat-icon" style={{ color: '#facc15' }}><Landmark size={24} /></div>
        </div>

        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Active Loans</p>
            <h3>₹{summary.totalRemainingLoan.toLocaleString('en-IN')}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Disbursed: ₹{summary.totalDisbursedLoan.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="stat-icon" style={{ color: '#f87171' }}><CreditCard size={24} /></div>
        </div>
      </div>

      {/* Financial Section */}
      <div className="grid-2 mb-4">
        {/* Savings distribution list */}
        <div className="glass-card">
          <h3 className="mb-3" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} className="text-success" />
            Savings Distribution by NHG Unit
          </h3>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>NHG Unit Name</th>
                  <th>Group Code</th>
                  <th className="text-right">Total Contributed Savings</th>
                </tr>
              </thead>
              <tbody>
                {savingsByNhg.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center" style={{ color: 'var(--text-secondary)' }}>
                      No savings logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  savingsByNhg.map((nhgLog, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{nhgLog.nhg}</td>
                      <td><code>{nhgLog.code}</code></td>
                      <td className="text-right" style={{ color: '#4ade80', fontWeight: 600 }}>
                        ₹{nhgLog.totalSavings.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan Repayments Recovery Metrics */}
        <div className="glass-card">
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Loan Repayment & Recovery Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Repayment Recovery Rate</span>
                <span style={{ fontWeight: 700, color: '#4ade80' }}>
                  {summary.totalDisbursedLoan > 0 
                    ? `${Math.round((summary.totalRecoveredLoan / summary.totalDisbursedLoan) * 100)}%`
                    : 'N/A'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), #4ade80)', 
                  width: summary.totalDisbursedLoan > 0 
                    ? `${(summary.totalRecoveredLoan / summary.totalDisbursedLoan) * 100}%`
                    : '0%'
                }}></div>
              </div>
            </div>

            <div className="flex justify-between" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recovered Amount</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80', marginTop: '0.25rem' }}>
                  ₹{summary.totalRecoveredLoan.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--dark-border)', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Outstanding Balance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171', marginTop: '0.25rem' }}>
                  ₹{summary.totalRemainingLoan.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              * These financial calculations represent values recorded across all NHGs. Standard interest calculation of 4% per annum is applied to all active member loans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
