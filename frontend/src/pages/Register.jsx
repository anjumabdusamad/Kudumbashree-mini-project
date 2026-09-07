import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User as UserIcon, Mail, Phone, Lock, Eye, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'member',
    nhgId: '',
    adminSecret: ''
  });
  
  const [nhgs, setNhgs] = useState([]);
  const [loadingNhgs, setLoadingNhgs] = useState(true);
  const [errMessage, setErrMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Verification step states
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [isVerifiedSuccessfully, setIsVerifiedSuccessfully] = useState(false);

  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNhgs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/nhgs');
        if (res.data.success && res.data.nhgs.length > 0) {
          setNhgs(res.data.nhgs);
          setFormData(prev => ({ 
            ...prev, 
            nhgId: res.data.nhgs.some(n => n._id === prev.nhgId) ? prev.nhgId : res.data.nhgs[0]._id 
          }));
        }
      } catch (err) {
        console.error('Error fetching NHGs for registration:', err);
      } finally {
        setLoadingNhgs(false);
      }
    };
    fetchNhgs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage('');
    setSuccessMessage('');
    
    // Validations
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setErrMessage('Please fill in all general fields');
      return;
    }

    if (formData.role === 'member' && !formData.nhgId) {
      setErrMessage('Please select an NHG unit');
      return;
    }

    if (formData.role === 'admin' && !formData.adminSecret) {
      setErrMessage('Please provide the Admin Secret Key');
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await register(formData);
      setVerificationEmail(formData.email);
      setVerificationStep(true);
      setSuccessMessage(res.message);
    } catch (err) {
      setErrMessage(err.message || 'Registration failed.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrMessage('');
    setSuccessMessage('');

    if (!otpCode || otpCode.length !== 6) {
      setErrMessage('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await verifyOTP(verificationEmail, otpCode);
      setIsVerifiedSuccessfully(true);
      if (res.approved) {
        setSuccessMessage('Email verified successfully! Logging you in...');
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setSuccessMessage('Email verified successfully! Your registration is now pending review and approval from the administrator.');
      }
    } catch (err) {
      console.error(err);
      setErrMessage(err.message || 'OTP Verification failed.');
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'var(--dark-bg)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem 2rem' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#fff' }}>
            {!verificationStep ? 'Join Kudumbashree' : 'Verify Email Address'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {!verificationStep 
              ? 'Register as a self-help group member or administrator' 
              : `Enter the code sent to ${verificationEmail}`}
          </p>
        </div>

        {errMessage && (
          <div className="flex align-center gap-1 mb-4" style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '0.85rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex align-center gap-1 mb-4" style={{
            padding: '0.75rem 1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 'var(--radius-sm)',
            color: '#4ade80',
            fontSize: '0.85rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {!verificationStep ? (
          /* Step 1: Info Form */
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="E.g., Radha Devi"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="radha@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select NHG (Neighborhood Group)</label>
              {loadingNhgs ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading NHG list...</div>
              ) : nhgs.length === 0 ? (
                <div className="text-danger" style={{ fontSize: '0.85rem' }}>
                  No active NHGs found. Please contact Administrator.
                </div>
              ) : (
                <select
                  name="nhgId"
                  className="form-control form-select"
                  value={formData.nhgId}
                  onChange={handleChange}
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
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? 'Registering...' : 'Register & Send OTP'}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group mb-4">
              <label className="form-label">Enter 6-digit Verification Code (OTP)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <KeyRound size={18} />
                </span>
                <input
                  type="text"
                  maxLength="6"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
                  required
                  disabled={isVerifiedSuccessfully}
                />
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                Check your server terminal console for the generated OTP!
              </small>
            </div>

            {!isVerifiedSuccessfully ? (
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={loadingVerify}
              >
                {loadingVerify ? 'Verifying...' : 'Verify Code'}
              </button>
            ) : (
              <div className="text-center">
                <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  ✓ Verification Successful
                </span>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-dark btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setVerificationStep(false);
                  setErrMessage('');
                  setSuccessMessage('');
                }}
                disabled={isVerifiedSuccessfully}
              >
                Edit Info
              </button>
              <button
                type="button"
                className="btn btn-dark btn-sm"
                style={{ flex: 1 }}
                onClick={handleSubmit} // Resends code
                disabled={loadingSubmit || isVerifiedSuccessfully}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
