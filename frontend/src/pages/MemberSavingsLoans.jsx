import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Landmark, CreditCard, ShieldAlert, CheckCircle, ArrowUpRight, Coins, Calendar, FileText } from 'lucide-react';
import { generateFinancialReport } from '../utils/pdfGenerator';

const MemberSavingsLoans = () => {
  const { user } = useAuth();
  
  const [savings, setSavings] = useState([]);
  const [loadingSavings, setLoadingSavings] = useState(true);

  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  
  // Apply Loan form state
  const [loanForm, setLoanForm] = useState({ amount: '', purpose: '', durationMonths: '12' });
  const [loadingLoanSubmit, setLoadingLoanSubmit] = useState(false);

  // Repayment form state
  const [repayForm, setRepayForm] = useState({ amount: '', reference: 'Net Banking' });
  const [loadingRepaySubmit, setLoadingRepaySubmit] = useState(false);
  const [showRepayInput, setShowRepayInput] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSavingsHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/savings/my-history');
      if (res.data.success) {
        setSavings(res.data.savings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSavings(false);
    }
  };

  const fetchLoansHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/loans/my-loans');
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    if (user?.nhg) {
      fetchSavingsHistory();
      fetchLoansHistory();
    }
  }, [user]);

  const handleLoanChange = (e) => {
    const { name, value } = e.target;
    setLoanForm(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!loanForm.amount || !loanForm.purpose || !loanForm.durationMonths) {
      setError('Please fill in all loan fields');
      return;
    }

    setLoadingLoanSubmit(true);
    try {
      const res = await axios.post('http://localhost:5000/api/loans', loanForm);
      if (res.data.success) {
        setMessage('Loan application submitted successfully! Pending administrator audit.');
        setLoanForm({ amount: '', purpose: '', durationMonths: '12' });
        fetchLoansHistory();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setLoadingLoanSubmit(false);
    }
  };

  const handleRepayLoan = async (e, loanId) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!repayForm.amount || Number(repayForm.amount) <= 0) {
      setError('Please provide a valid repayment amount');
      return;
    }

    setLoadingRepaySubmit(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/loans/${loanId}/repay`, repayForm);
      if (res.data.success) {
        setMessage(res.data.message);
        setRepayForm({ amount: '', reference: 'Net Banking' });
        setShowRepayInput(false);
        fetchLoansHistory();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Repayment failed.');
    } finally {
      setLoadingRepaySubmit(false);
    }
  };

  if (!user?.nhg) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem 1rem' }}>
        <h3>No NHG Unit Assigned</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          You have not been assigned to any Neighborhood Group yet. Financial features are locked until assignment.
        </p>
      </div>
    );
  }

  // Find active approved/pending loan
  const activeLoan = loans.find(l => ['pending', 'approved'].includes(l.status));

  return (
    <div>
      <div className="flex justify-between align-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="mb-1" style={{ fontSize: '2rem' }}>Savings & Loans Hub</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your weekly savings deposits, active micro-finance credit files, and payments</p>
        </div>

        <button
          className="btn btn-primary flex align-center gap-1"
          onClick={() => generateFinancialReport(user, savings, loans)}
          style={{ background: '#10b981', borderColor: '#10b981' }}
        >
          <FileText size={18} />
          <span>Download PDF Statement</span>
        </button>
      </div>

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

      {/* Overview stats */}
      <div className="stats-grid mb-4">
        <div className="glass-card stat-card">
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>My Total Savings</p>
            <h3 style={{ fontSize: '2rem', color: '#fff', marginTop: '0.2rem' }}>
              ₹{user.savingsBalance.toLocaleString('en-IN')}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated automatically upon weekly deposits</span>
          </div>
          <div className="stat-icon" style={{ color: '#4ade80' }}><Landmark size={24} /></div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Disbursed Loan Wallet</p>
            <h3 style={{ fontSize: '2rem', color: '#fff', marginTop: '0.2rem' }}>
              ₹{(user.walletBalance || 0).toLocaleString('en-IN')}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Disbursed funds available for store purchases</span>
          </div>
          <div className="stat-icon" style={{ color: 'var(--secondary)' }}><Coins size={24} /></div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outstanding Loan Bal.</p>
            <h3 style={{ fontSize: '2rem', color: activeLoan?.status === 'approved' ? '#f87171' : '#9ca3af', marginTop: '0.2rem' }}>
              ₹{(activeLoan?.status === 'approved' ? activeLoan.remainingAmount : 0).toLocaleString('en-IN')}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {activeLoan ? `Status: ${activeLoan.status.toUpperCase()}` : 'No active loans'}
            </span>
          </div>
          <div className="stat-icon" style={{ color: '#f87171' }}><CreditCard size={24} /></div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interest Rate</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>4% P.A.</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kudumbashree micro-finance standard</span>
          </div>
          <div className="stat-icon" style={{ color: 'var(--secondary)' }}><Coins size={24} /></div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        {/* Loan Operations Card */}
        <div className="glass-card">
          {activeLoan ? (
            // User has an active loan file
            <div>
              <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Active Loan Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Loan Purpose:</span>
                  <span style={{ fontWeight: 600 }}>{activeLoan.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Original Amount:</span>
                  <span style={{ fontWeight: 600 }}>₹{activeLoan.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Outstanding Balance:</span>
                  <span style={{ fontWeight: 700, color: activeLoan.status === 'approved' ? '#f87171' : 'var(--text-secondary)' }}>
                    ₹{activeLoan.remainingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Monthly Installment:</span>
                  <span style={{ fontWeight: 600 }}>₹{activeLoan.monthlyInstallment}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span className={`badge ${activeLoan.status === 'approved' ? 'badge-info' : 'badge-warning'}`}>
                    {activeLoan.status}
                  </span>
                </div>
              </div>

              {activeLoan.status === 'approved' && (
                <div className="mt-4">
                  {!showRepayInput ? (
                    <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => {
                      setRepayForm(prev => ({ ...prev, amount: activeLoan.monthlyInstallment.toString() }));
                      setShowRepayInput(true);
                    }}>
                      Repay Installment online
                    </button>
                  ) : (
                    <form onSubmit={(e) => handleRepayLoan(e, activeLoan._id)} style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Payment Amount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max={activeLoan.remainingAmount}
                          value={repayForm.amount}
                          onChange={(e) => setRepayForm(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group mb-4">
                        <label className="form-label">Reference ID (e.g. UPI, NetBanking reference)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={repayForm.reference}
                          onChange={(e) => setRepayForm(prev => ({ ...prev, reference: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="btn btn-dark" style={{ flex: 1 }} onClick={() => setShowRepayInput(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loadingRepaySubmit}>
                          {loadingRepaySubmit ? 'Processing Payment...' : 'Confirm Repayment'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Apply for loan
            <div>
              <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Apply for NHG Microfinance Loan</h3>
              <form onSubmit={handleApplyLoan}>
                <div className="form-group">
                  <label className="form-label">Requested Loan Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    placeholder="Enter principal amount (e.g., 10000)"
                    min="500"
                    value={loanForm.amount}
                    onChange={handleLoanChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Repayment Tenure Duration (Months)</label>
                  <select
                    name="durationMonths"
                    className="form-control form-select"
                    value={loanForm.durationMonths}
                    onChange={handleLoanChange}
                    required
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">State Loan Purpose</label>
                  <textarea
                    name="purpose"
                    rows="3"
                    className="form-control"
                    placeholder="E.g., Purchase sewing machine, launch pickle manufacturing startup unit..."
                    value={loanForm.purpose}
                    onChange={handleLoanChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingLoanSubmit}>
                  <ArrowUpRight size={18} /> {loadingLoanSubmit ? 'Submitting Application...' : 'Submit Loan Request'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Savings contributions Ledger */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Savings Contribution Ledger</h3>
          {loadingSavings ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading ledger logs...</p>
          ) : savings.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No deposits recorded yet. Savings are logged by the NHG administrator/treasurer.</p>
          ) : (
            <div className="table-container" style={{ flexGrow: 1, maxHeight: '380px', overflowY: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Deposit Date</th>
                    <th>Reference / Description</th>
                    <th className="text-right">Credited Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.map((s) => (
                    <tr key={s._id}>
                      <td>{new Date(s.date).toLocaleDateString()}</td>
                      <td>{s.description}</td>
                      <td className="text-right" style={{ color: '#4ade80', fontWeight: 600 }}>+ ₹{s.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Loan History Grid */}
      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Loan Auditing History</h3>
        {loadingLoans ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading logs...</p>
        ) : loans.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No past loan files recorded.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Application Date</th>
                  <th>Principal Amount</th>
                  <th>Monthly Repayment</th>
                  <th>Purpose</th>
                  <th>Balance Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>{new Date(loan.applicationDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{loan.amount.toLocaleString('en-IN')}</td>
                    <td>₹{loan.monthlyInstallment}/month ({loan.durationMonths} mos)</td>
                    <td>{loan.purpose}</td>
                    <td style={{ fontWeight: 700, color: loan.status === 'approved' ? '#f87171' : 'inherit' }}>
                      ₹{loan.remainingAmount.toLocaleString('en-IN')}
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

export default MemberSavingsLoans;
