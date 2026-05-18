import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth, INTERNAL_ROLES } from '../context/AuthContext';
import { requestLoginOtp, verifyLoginOtp } from '../api/axios';

export default function LoginPage() {
  const { login, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('bank_employee');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  if (loading) {
    return (
      <div className="route-loading">
        <div className="spinner route-loading__spinner" aria-hidden="true" />
      </div>
    );
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await requestLoginOtp(email);
      setSuccessMsg(data.message || 'OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. User may not exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await verifyLoginOtp(email, otp);
      if (data.success) {
        if (!INTERNAL_ROLES.includes(role)) {
          login({ user: data.user, token: data.token, role });
          navigate('/customer', { replace: true });
        } else {
          login({ user: data.user, token: data.token, role });
          navigate(from.startsWith('/dashboard') ? from : '/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Shield size={32} color={role === 'customer' ? '#019EEC' : '#005494'} />
          <div>
            <h1>{role === 'customer' ? 'SuRaksha NetBanking' : 'SuRaksha Enterprise'}</h1>
            <p>{role === 'customer' ? 'Customer Portal Login' : 'Employee & Admin Portal'}</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="login-form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </label>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="bank_employee">Bank Employee / Underwriter</option>
                <option value="compliance_auditor">Internal Compliance Auditor</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer (Redirects to User Dashboard)</option>
              </select>
            </label>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
              {isLoading ? 'Requesting...' : 'Request Secure OTP'} <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="success-banner" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#e6f4ea', color: '#137333', borderRadius: 6, marginBottom: 16 }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: 13 }}>{successMsg}</span>
            </div>
            <label>
              Enter 6-Digit OTP
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: 18 }}
              />
            </label>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" className="btn btn--outline btn--block" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        )}

        <p className="login-footer">
          {role === 'customer' ? (
            <>New to SuRaksha? <Link to="/register">Register Here</Link></>
          ) : (
            <>Authorized personnel only.</>
          )}
          <br /><br />
          <Link to="/">← Back to welcome</Link>
        </p>
      </div>
    </div>
  );
}
