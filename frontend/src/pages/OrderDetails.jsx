import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const VISUAL_STATUS_STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

function mapBackendStatusToVisual(status) {
  if (!status) return 'Placed';
  if (status === 'Placed') return 'Placed';
  if (status === 'Confirmed') return 'Packed';
  if (status === 'Shipped') return 'Shipped';
  if (status === 'Out for Delivery') return 'Shipped';
  if (status === 'Delivered') return 'Delivered';
  if (status === 'Cancelled') return 'Cancelled';
  return 'Placed';
}

function getCurrentStatus(order) {
  const backend = order?.orderStatus || (order?.isDelivered ? 'Delivered' : 'Placed');
  return mapBackendStatusToVisual(backend);
}

function buildHistory(order) {
  const arr = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  const normalized = arr
    .filter((x) => x && x.status)
    .map((x) => ({
      status: x.status,
      date: x.date ? new Date(x.date) : null,
      note: x.note,
    }))
    .sort((a, b) => {
      const ad = a.date ? a.date.getTime() : 0;
      const bd = b.date ? b.date.getTime() : 0;
      return ad - bd;
    });

  if (normalized.length === 0) {
    const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
    return [{ status: 'Placed', date: createdAt, note: 'Order placed' }];
  }

  return normalized;
}

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      if (!user || !id) return;
      try {
        setError('');
        const res = await fetch(`/api/orders/${id}`, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch order');
        }
        if (isMounted) setOrder(data);
      } catch (e) {
        if (isMounted) setError(e?.message || 'Failed to fetch order');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    const interval = setInterval(fetchOrder, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, id]);

  const history = useMemo(() => buildHistory(order), [order]);
  const currentStatus = useMemo(() => getCurrentStatus(order), [order]);

  const activeStepIndex = useMemo(() => {
    if (currentStatus === 'Cancelled') return -1;
    const idx = VISUAL_STATUS_STEPS.indexOf(currentStatus);
    return idx >= 0 ? idx : 0;
  }, [currentStatus]);

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h1 className="profile-title">Order Details</h1>
            <Link className="view-orders-btn" to="/my-orders">
              Back to My Orders
            </Link>
          </div>

          {loading && <div style={{ padding: 12 }}>Loading...</div>}
          {!loading && error && <div style={{ padding: 12, color: 'crimson' }}>{error}</div>}

          {!loading && !error && order && (
            <>
              <div className="order-card" style={{ marginBottom: 16 }}>
                <div className="order-header">
                  <div>
                    <h3>Order #{String(order._id).slice(-6)}</h3>
                    <p className="order-date">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.orderStatus || ''}`}>{order.orderStatus}</span>
                    <p className="order-total">₹ {Number(order.totalPrice || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="order-card" style={{ marginBottom: 16 }}>
                <h2 style={{ marginBottom: 10 }}>Tracking</h2>

                {currentStatus === 'Cancelled' ? (
                  <div style={{ color: 'crimson', fontWeight: 600 }}>This order was cancelled.</div>
                ) : (
                  <div className="tracking">
                    <div className="tracking-bar" aria-hidden="true">
                      <div
                        className="tracking-bar-fill"
                        style={{ width: `${Math.round(((activeStepIndex + 1) / VISUAL_STATUS_STEPS.length) * 100)}%` }}
                      />
                    </div>

                    <div className="tracking-steps">
                      {VISUAL_STATUS_STEPS.map((step, idx) => {
                        const done = idx <= activeStepIndex;
                        const current = idx === activeStepIndex;
                        return (
                          <div key={step} className={`tracking-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                            <div className="tracking-dot" />
                            <div className="tracking-label">{step}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="tracking-meta">
                  <div className="tracking-meta-row">
                    <strong>Carrier:</strong> <span>{order.shippingTracking?.carrier || '—'}</span>
                  </div>
                  <div className="tracking-meta-row">
                    <strong>Tracking #:</strong> <span>{order.shippingTracking?.trackingNumber || '—'}</span>
                  </div>
                  <div className="tracking-meta-row">
                    <strong>Estimated delivery:</strong>{' '}
                    <span>
                      {order.shippingTracking?.estimatedDelivery
                        ? new Date(order.shippingTracking.estimatedDelivery).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                  <div className="tracking-meta-row">
                    <strong>Last location:</strong> <span>{order.shippingTracking?.lastLocation || '—'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Timeline</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {history.map((h, i) => (
                      <div key={`${h.status}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{h.status}</div>
                          {h.note ? <div style={{ opacity: 0.7, fontSize: 12 }}>{h.note}</div> : null}
                        </div>
                        <div style={{ opacity: 0.7, fontSize: 12, whiteSpace: 'nowrap' }}>
                          {h.date ? h.date.toLocaleString('en-IN') : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-card" style={{ marginBottom: 16 }}>
                <h2 style={{ marginBottom: 10 }}>Items</h2>
                <div className="order-items-list">
                  {(order.orderItems || []).map((item, idx) => (
                    <div key={`${item.product}-${idx}`} className="order-item-card">
                      <img src={item.image || '/hero.png'} alt={item.name} />
                      <div>
                        <p>{item.name}</p>
                        <small>
                          {item.customization?.size && `Size: ${item.customization.size} `}
                          {item.customization?.color && `Color: ${item.customization.color} `}
                          Qty: {item.qty}
                        </small>
                      </div>
                      <p>₹ {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-card" style={{ marginBottom: 16 }}>
                <h2 style={{ marginBottom: 10 }}>Shipping</h2>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div>{order.shippingAddress?.address}</div>
                  <div>
                    {order.shippingAddress?.city} {order.shippingAddress?.postalCode ? `- ${order.shippingAddress.postalCode}` : ''}
                  </div>
                  <div>{order.shippingAddress?.country}</div>
                </div>
              </div>

              <div className="order-card" style={{ marginBottom: 16 }}>
                <h2 style={{ marginBottom: 10 }}>Payment</h2>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div>
                    <strong>Method:</strong> {
                      order.paymentMethod === 'card' ? 'Credit/Debit Card' :
                      order.paymentMethod === 'upi' ? 'UPI' :
                      order.paymentMethod === 'netbanking' ? 'Net Banking' :
                      order.paymentMethod
                    }
                  </div>
                  <div>
                    <strong>Status:</strong> {order.isPaid ? 'Payment Successful' : 'Pending'}
                  </div>
                  {order.paidAt && (
                    <div>
                      <strong>Paid On:</strong> {new Date(order.paidAt).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
