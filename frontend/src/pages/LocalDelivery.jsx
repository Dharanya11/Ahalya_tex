import Footer from '../components/Footer';

export default function LocalDelivery() {
  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <h1 className="profile-title">Local Delivery</h1>

          <div className="order-card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 10 }}>Fast & Reliable Delivery</h2>
            <div style={{ opacity: 0.8, lineHeight: 1.7 }}>
              We deliver across Coimbatore and nearby areas with realistic delivery updates and estimated timelines.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div className="order-card">
              <h3 style={{ marginBottom: 8 }}>Estimated Delivery Times</h3>
              <div style={{ display: 'grid', gap: 8, opacity: 0.9 }}>
                <div><strong>Coimbatore City:</strong> Same day to 1 day</div>
                <div><strong>Nearby Areas (15–30 km):</strong> 1–2 days</div>
                <div><strong>Outer Areas (30–60 km):</strong> 2–3 days</div>
              </div>
            </div>

            <div className="order-card">
              <h3 style={{ marginBottom: 8 }}>Service Areas</h3>
              <div style={{ opacity: 0.9, lineHeight: 1.7 }}>
                Coimbatore, Peelamedu, Gandhipuram, RS Puram, Saibaba Colony, Singanallur, Saravanampatti,
                and nearby localities.
              </div>
            </div>

            <div className="order-card">
              <h3 style={{ marginBottom: 8 }}>Delivery Attempts</h3>
              <div style={{ opacity: 0.9, lineHeight: 1.7 }}>
                If you’re unavailable, our delivery partner will attempt again. Keep your phone reachable for
                smoother delivery.
              </div>
            </div>
          </div>

          <div className="order-card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 10 }}>Tracking Updates (Realistic)</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div><strong>Order Placed</strong><div style={{ opacity: 0.7, fontSize: 12 }}>We received your order</div></div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Instant</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div><strong>Confirmed</strong><div style={{ opacity: 0.7, fontSize: 12 }}>Packed and ready to dispatch</div></div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Within a few hours</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div><strong>Shipped</strong><div style={{ opacity: 0.7, fontSize: 12 }}>Handed over to delivery partner</div></div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Same day / next day</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div><strong>Out for Delivery</strong><div style={{ opacity: 0.7, fontSize: 12 }}>Rider is on the way</div></div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Delivery day</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div><strong>Delivered</strong><div style={{ opacity: 0.7, fontSize: 12 }}>Delivered successfully</div></div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Delivery day</div>
              </div>
            </div>
          </div>

          <div className="order-card">
            <h2 style={{ marginBottom: 10 }}>Need help?</h2>
            <div style={{ opacity: 0.85, lineHeight: 1.7 }}>
              You can track every order under <strong>My Orders</strong> and see live status updates. For delivery questions,
              contact support from the Contact page.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
