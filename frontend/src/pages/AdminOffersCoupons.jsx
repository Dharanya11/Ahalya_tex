import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminOffersCoupons() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin?tab=offers', { replace: true });
  }, [navigate]);

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>Offers & Coupons</h1>
      <div>Redirecting...</div>
    </div>
  );
}
