import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle, User, CreditCard, Lock } from 'lucide-react';
import { requestSignup } from '../api/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    phone: '',
    address: '',
    accountNo: '',
    ifscCode: '',
    branchName: '',
    aadhaarNumber: '',
    panCardNo: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await requestSignup(formData);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircle size={48} color="#137333" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 8 }}>Registration Successful!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You can now log in securely with your email.</p>
          <p style={{ fontSize: 13, marginTop: 24, color: '#666' }}>Redirecting to Login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page" style={{ padding: '40px 20px' }}>
      <div className="login-card" style={{ maxWidth: 600 }}>
        <div className="login-brand" style={{ marginBottom: 24 }}>
          <Shield size={32} />
          <div>
            <h1>SuRaksha</h1>
            <p>New Customer Registration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h3 className="section-title"><User size={16} /> Personal Information</h3>
          <div className="form-grid">
            <label>
              Full Name
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per bank records" required />
            </label>
            <label>
              Email Address
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </label>
            <label>
              Phone Number
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" required />
            </label>
            <label>
              Date of Birth
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Current Address
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full address details" rows={2} required />
            </label>
          </div>

          <h3 className="section-title" style={{ marginTop: 24 }}><CreditCard size={16} /> Banking Details</h3>
          <div className="form-grid">
            <label>
              Account Number
              <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} placeholder="e.g. 0123456789" required />
            </label>
            <label>
              Branch Name
              <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="e.g. MG Road Branch" required />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              IFSC Code
              <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="e.g. CNRB0001234" required />
            </label>
          </div>

          <h3 className="section-title" style={{ marginTop: 24 }}><Lock size={16} /> Identity & KYC</h3>
          <div className="form-grid">
            <label>
              Aadhaar Number
              <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="12-digit Aadhaar" pattern="\d{12}" title="12-digit numeric code" required />
            </label>
            <label>
              PAN Card Number
              <input type="text" name="panCardNo" value={formData.panCardNo} onChange={handleChange} placeholder="e.g. ABCDE1234F" pattern="[A-Z]{5}\d{4}[A-Z]{1}" title="Valid PAN format (e.g., ABCDE1234F)" style={{ textTransform: 'uppercase' }} required />
            </label>
          </div>

          {error && <div className="error-text" style={{ marginTop: 16 }}>{error}</div>}

          <button type="submit" className="btn btn--primary btn--block" style={{ marginTop: 24 }} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Complete Registration'} <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </button>
        </form>

        <p className="login-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>

      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
        }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
