import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireInternal = true }) {
  const { user, loading, isInternalEmployee } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading">
        <div className="spinner route-loading__spinner" aria-hidden="true" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireInternal && !isInternalEmployee) {
    return <Navigate to="/customer" replace />;
  }

  return children;
}
