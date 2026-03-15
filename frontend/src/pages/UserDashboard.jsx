import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await fetch('/api/user/dashboard', { credentials: 'include' });
        const json = await res.json();
        if (!res.ok) {
          // If token expired/invalid, log out locally and go home
          if (res.status === 401) {
            logout();
            navigate('/', { state: { message: 'Session expired. Please login again.' } });
            return;
          }
          setError(json?.message || 'Failed to load dashboard');
          return;
        }
        setData(json);
      } catch (e) {
        setError(e.message || 'Failed to load dashboard');
      }
    };

    if (!isLoading) load();
  }, [isLoading, logout, navigate]);

  if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 24 }}>Please login to view your dashboard.</div>;

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>User Dashboard</h1>
      {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
      {data && (
        <pre style={{ background: '#111', color: '#eee', padding: 12, borderRadius: 8, overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

