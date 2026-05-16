import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth, INTERNAL_ROLES } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, isInternalEmployee } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('bank_employee');
  const [error, setError] = useState('');

  if (isAuthenticated && isInternalEmployee) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required for session identity.');
      return;
    }
    if (!INTERNAL_ROLES.includes(role)) {
      navigate('/customer', { replace: true });
      return;
    }
    login({ email, name, role });
    navigate(from.startsWith('/dashboard') ? from : '/dashboard', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Shield size={32} />
          <div>
            <h1>SuRaksha</h1>
            <p>Canara Bank — Employee Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@canarabank.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="bank_employee">Bank Employee / Underwriter</option>
              <option value="compliance_auditor">Internal Compliance Auditor</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer (redirects to user dashboard)</option>
            </select>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn--primary btn--block">
            Sign in securely
          </button>
        </form>

        <p className="login-footer">
          <Link to="/">← Back to welcome</Link>
        </p>
      </div>
    </div>
  );
}
