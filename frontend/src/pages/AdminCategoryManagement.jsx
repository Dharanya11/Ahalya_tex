import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminCategoryManagement() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin?tab=categories', { replace: true });
  }, [navigate]);

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>Category Management</h1>
      <div>Redirecting...</div>
    </div>
  );
}
