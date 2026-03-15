import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects /admin/* routes - only users with role "admin" can access.
 * Redirects normal users to home with an error state for showing "Unauthorized" message.
 */
export default function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading" style={{ padding: '40px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  // Not logged in -> redirect to home (login required)
  if (!user) {
    return <Navigate to="/" state={{ from: location, message: 'Please login to access this page.' }} replace />;
  }

  // Logged in but not admin -> block with error
  const isAdmin = user.role === 'admin' || user.isAdmin;
  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location, message: 'Unauthorized access. Admin privileges required.' }} replace />;
  }

  return children;
}
