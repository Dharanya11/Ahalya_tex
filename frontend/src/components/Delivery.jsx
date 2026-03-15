import { useNavigate } from 'react-router-dom';

export default function Delivery() {
  const navigate = useNavigate();

  return (
    <section className="delivery">
      <div className="delivery-content">
        <div className="delivery-text">
          <h2>Local Delivery Information</h2>
          <p>Fast & Reliable Delivery in Coimbatore and Nearby Areas</p>
          <button type="button" onClick={() => navigate('/local-delivery')}>Learn More</button>
        </div>
        <div className="delivery-icon">🚚</div>
      </div>
    </section>
  );
}
