import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Landmark, ArrowUpRight, ArrowDownRight, ShieldAlert, CheckCircle, Search, CreditCard, DollarSign } from 'lucide-react';

const FinancialTracker = () => {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);

  // Savings form state
  const [savingsData, setSavingsData] = useState({ userId: '', amount: '50', description: 'Weekly Savings Contribution' });
  const [loadingSavings, setLoadingSavings] = useState(false);

  // Repayment form state
  const [repayData, setRepayData] = useState({ loanId: '', amount: '', reference: '' });
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [loadingRepay, setLoadingRepay] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [loanSearchQuery, setLoanSearchQuery] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users?role=member&status=approved');
      if (res.data.success) {
        setMembers(res.data.users);
        if (res.data.users.length > 0) {
          setSavingsData(prev => ({ ...prev, userId: res.data.users[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch members dropdown list.');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/loans/all');
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load loan applications.');
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchLoans();
  }, []);

  const handleSavingsChange = (e) => {
    const { name, value } = e.target;
    setSavingsData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordSavings = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!savingsData.userId || !savingsData.amount) {
      setError('Please fill in member and amount');
      return;
    }

    setLoadingSavings(true);
    try {
      const res = await axios.post('http://localhost:5000/api/savings', savingsData);
      if (res.data.success) {
        const selectedMemberName = members.find(m => m._id === savingsData.userId)?.name || 'Member';
        setMessage(`Successfully credited ₹${savingsData.amount} savings to ${selectedMemberName}!`);
        setSavingsData(prev => ({ ...prev, amount: '50', description: 'Weekly Savings Contribution' }));
        fetchMembers(); // refresh balances
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to credit savings');
    } finally {
      setLoadingSavings(false);
    }
  };

  const handleLoanStatusUpdate = async (loanId, newStatus) => {
    setMessage('');
    setError('');

    try {
      const res = await axios.put(`http://localhost:5000/api/loans/${loanId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        setMessage(`Loan application successfully ${newStatus === 'approved' ? 'approved' : 'rejected'}!`);
        fetchLoans();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update loan status');
    }
  };

  const openRepayDialog = (loan) => {
    setRepayData({
      loanId: loan._id,
      amount: loan.monthlyInstallment.toString(),
      reference: 'Cash / Bank Transfer'
    });
    setShowRepayModal(true);
  };

  const handleRecordRepayment = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoadingRepay(true);

    try {
      const res = await axios.post(`http://localhost:5000/api/loans/${repayData.loanId}/repay`, {
        amount: repayData.amount,
        reference: repayData.reference
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setShowRepayModal(false);
        fetchLoans();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to record repayment');
    } finally {
      setLoadingRepay(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const query = loanSearchQuery.toLowerCase();
    return (
      loan.user?.name.toLowerCase().includes(query) ||
      loan.nhg?.name.toLowerCase().includes(query) ||
      loan.status.toLowerCase().includes(query)
    );
  });

  if (loadingMembers && loadingLoans) return <div style={{ color: 'var(--text-secondary)' }}>Loading financial registers...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Financial Tracking & Audit</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Record weekly member savings deposits and process micro-credit loan applications</p>

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
        {/* Credit Savings */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem', display: 'flex', align: 'center', gap: '0.5rem' }}>
            <Landmark size={20} className="text-success" />
            Credit Member Savings
          </h3>
          <form onSubmit={handleRecordSavings}>
            <div className="form-group">
              <label className="form-label">Select Active Member</label>
              {loadingMembers ? (
                <p>Loading members list...</p>
              ) : members.length === 0 ? (
                <p className="text-danger">No approved members found in database.</p>
              ) : (
                <select
                  name="userId"
                  className="form-control form-select"
                  value={savingsData.userId}
                  onChange={handleSavingsChange}
                  required
                >
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.nhg?.name || 'No Group'}) - Current: ₹{m.savingsBalance}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Savings Amount (₹)</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                placeholder="50"
                min="1"
                value={savingsData.amount}
                onChange={handleSavingsChange}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Transaction Label</label>
              <input
                type="text"
                name="description"
                className="form-control"
                value={savingsData.description}
                onChange={handleSavingsChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingSavings || members.length === 0}>
              <ArrowUpRight size={18} /> {loadingSavings ? 'Processing...' : 'Deposit Savings'}
            </button>
          </form>
        </div>

        {/* Repayment Modal / Drawer overlay inline */}
        {showRepayModal && (
          <div className="glass-card" style={{ border: '2px solid var(--secondary)', height: 'fit-content' }}>
            <h3 className="mb-3" style={{ fontSize: '1.25rem', display: 'flex', align: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} className="text-success" />
              Log Loan Repayment
            </h3>
            
            <form onSubmit={handleRecordRepayment}>
              <div className="form-group">
                <label className="form-label">Repayment Installment Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={repayData.amount}
                  onChange={(e) => setRepayData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Reference (e.g. Bank slip, Cash receipt)</label>
                <input
                  type="text"
                  className="form-control"
                  value={repayData.reference}
                  onChange={(e) => setRepayData(prev => ({ ...prev, reference: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-dark" style={{ flex: 1 }} onClick={() => setShowRepayModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 2 }} disabled={loadingRepay}>
                  {loadingRepay ? 'Recording...' : 'Log Repayment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!showRepayModal && (
          <div className="glass-card flex align-center justify-center text-center" style={{ minHeight: '300px' }}>
            <div>
              <Landmark size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Credit weekly savings on the left, or process loan application status and record repayments in the index below.</p>
            </div>
          </div>
        )}
      </div>

      {/* Loan Applications List */}
      <div className="glass-card">
        <div className="flex justify-between align-center mb-3">
          <h3 style={{ fontSize: '1.25rem' }}>Loan Applications & Micro-Credit Index</h3>
          {/* Search */}
          <div style={{ position: 'relative', width: '250px' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control btn-sm"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
              placeholder="Search loans..."
              value={loanSearchQuery}
              onChange={(e) => setLoanSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loadingLoans ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading loan logs...</p>
        ) : filteredLoans.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No loan applications matched your filter.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Member Detail</th>
                  <th>Loan Amount</th>
                  <th>Repay Details</th>
                  <th>Outstanding Bal.</th>
                  <th>Status</th>
                  <th className="text-center">Review Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{loan.user?.name || 'Unknown User'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Group: {loan.nhg?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.1rem' }}>"{loan.purpose}"</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{loan.amount.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied: {new Date(loan.applicationDate).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>₹{loan.monthlyInstallment}/month</div>
                        <div>Duration: {loan.durationMonths} months</div>
                        <div>Interest: {loan.interestRate}% P.A.</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: loan.status === 'approved' ? '#f87171' : 'var(--text-muted)' }}>
                        ₹{loan.remainingAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        loan.status === 'approved' ? 'badge-info' :
                        loan.status === 'pending' ? 'badge-warning' :
                        loan.status === 'paid' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center gap-1">
                        {loan.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleLoanStatusUpdate(loan._id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleLoanStatusUpdate(loan._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openRepayDialog(loan)}
                          >
                            <DollarSign size={14} /> Log Repayment
                          </button>
                        )}
                        {loan.status === 'paid' && (
                          <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600 }}>Fully Paid Off</span>
                        )}
                        {loan.status === 'rejected' && (
                          <span style={{ fontSize: '0.85rem', color: '#f87171' }}>Rejected</span>
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

export default FinancialTracker;
