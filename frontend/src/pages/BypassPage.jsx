import { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidBypassCode } from '../config/authBypass';

/**
 * Skip DB login — visit:
 *   /bypass/suraksha-dev
 *   /bypass?code=suraksha-dev
 * Optional: ?name=Your+Name&role=bank_employee
 */
export default function BypassPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { code: routeCode } = useParams();

  useEffect(() => {
    const code = routeCode || search.get('code');

    if (!isValidBypassCode(code)) {
      navigate('/login', { replace: true });
      return;
    }

    login({
      name: search.get('name') || 'Dev Underwriter',
      email: search.get('email') || 'dev@canarabank.local',
      role: search.get('role') || 'bank_employee',
    });
    navigate('/dashboard', { replace: true });
  }, [routeCode, search, login, navigate]);

  return (
    <div className="route-loading">
      <div className="spinner route-loading__spinner" aria-hidden="true" />
    </div>
  );
}
