import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Landmark, CreditCard, Calendar, Bell, ArrowUpRight, CheckCircle2, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [activeLoan, setActiveLoan] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch savings history
        const savingsRes = await axios.get('http://localhost:5000/api/savings/my-history');
        if (savingsRes.data.success) {
          setSavingsHistory(savingsRes.data.savings.slice(0, 3));
        }

        // Fetch loans
        const loanRes = await axios.get('http://localhost:5000/api/loans/my-loans');
        if (loanRes.data.success) {
          const unpaid = loanRes.data.loans.find(l => ['pending', 'approved'].includes(l.status));
          setActiveLoan(unpaid || null);
        }

        // Fetch meetings
        const meetingRes = await axios.get('http://localhost:5000/api/meetings/my-nhg');
        if (meetingRes.data.success) {
          // Filter meetings where date is in future or today
          const today = new Date().setHours(0,0,0,0);
          const upcoming = meetingRes.data.meetings
            .filter(m => new Date(m.date) >= today)
            .slice(0, 2);
          setUpcomingMeetings(upcoming);
        }

        // Fetch notifications
        const notifRes = await axios.get('http://localhost:5000/api/notifications');
        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching member dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Overview...</div>;

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '2rem' }}>Welcome, {user.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Kudumbashree Unit: <strong style={{ color: 'var(--primary)' }}>{user.nhg?.name || 'Unassigned'}</strong> (Location: {user.nhg?.location || 'N/A'})
        </p>
      </div>

      {/* Grid of personal financial details */}
      <div className="stats-grid">
        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>My Savings Balance</p>
            <h3>₹{user.savingsBalance.toLocaleString('en-IN')}</h3>
            <Link to="/member/savings-loans" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', align: 'center', marginTop: '0.25rem' }}>
              View savings ledger <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="stat-icon" style={{ color: '#4ade80' }}><Landmark size={24} /></div>
        </div>

        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Disbursed Loan Wallet</p>
            <h3>₹{(user.walletBalance || 0).toLocaleString('en-IN')}</h3>
            <Link to="/member/savings-loans" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', align: 'center', marginTop: '0.25rem' }}>
              Verify balance <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="stat-icon" style={{ color: 'var(--secondary)' }}><Coins size={24} /></div>
        </div>

        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Active Loan Outstanding</p>
            {activeLoan ? (
              <>
                <h3>₹{activeLoan.remainingAmount.toLocaleString('en-IN')}</h3>
                <span className={`badge ${activeLoan.status === 'approved' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                  {activeLoan.status === 'approved' ? `Next Installment: ₹${activeLoan.monthlyInstallment}` : 'Pending Admin Approval'}
                </span>
              </>
            ) : (
              <>
                <h3>₹0</h3>
                <Link to="/member/savings-loans" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', align: 'center', marginTop: '0.25rem' }}>
                  Apply for a loan <ArrowUpRight size={12} />
                </Link>
              </>
            )}
          </div>
          <div className="stat-icon" style={{ color: '#f87171' }}><CreditCard size={24} /></div>
        </div>

        <div className="glass-card stat-card hoverable">
          <div className="stat-info">
            <p>Upcoming NHG Meetings</p>
            <h3>{upcomingMeetings.length}</h3>
            <Link to="/member/meetings" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', align: 'center', marginTop: '0.25rem' }}>
              View schedules <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="stat-icon" style={{ color: '#60a5fa' }}><Calendar size={24} /></div>
        </div>
      </div>

      <div className="grid-2">
        {/* Upcoming meetings and latest savings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming Meetings Card */}
          <div className="glass-card">
            <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Upcoming NHG Meetings</h3>
            {upcomingMeetings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upcoming meetings scheduled for your unit.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingMeetings.map((m) => (
                  <div key={m._id} style={{ display: 'flex', align: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', borderRadius: 'var(--radius-sm)' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {m.time}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Venue: {m.venue}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Agenda: {m.agenda}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Savings Contributions */}
          <div className="glass-card">
            <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Recent Savings Logs</h3>
            {savingsHistory.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No savings deposits recorded yet.</p>
            ) : (
              <div className="table-container">
                <table className="premium-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Label</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsHistory.map((s) => (
                      <tr key={s._id}>
                        <td>{new Date(s.date).toLocaleDateString()}</td>
                        <td>{s.description}</td>
                        <td className="text-right" style={{ color: '#4ade80', fontWeight: 600 }}>₹{s.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Welfare schemes quick references */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem', display: 'flex', align: 'center', gap: '0.5rem' }}>
            <Bell size={20} className="text-success" />
            Recent Notifications
          </h3>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No notifications received.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((n) => (
                <div key={n._id} style={{ padding: '1rem', background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(22, 163, 74, 0.05)', borderRadius: 'var(--radius-sm)', border: n.isRead ? '1px solid var(--dark-border)' : '1px solid rgba(22, 163, 74, 0.2)' }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: n.isRead ? '#fff' : 'var(--primary)' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
              ))}
              <Link to="/member/notifications" className="text-center" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>
                View all notifications
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
