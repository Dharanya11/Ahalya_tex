import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminManageUsers() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin?tab=users', { replace: true });
  }, [navigate]);

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>Manage Users</h1>
      <div>Redirecting...</div>
    </div>
  );
}
