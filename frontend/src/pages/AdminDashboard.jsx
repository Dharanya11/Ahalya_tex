import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const adminRes = await fetch('/api/admin/dashboard', { credentials: 'include' });
        const adminJson = await adminRes.json().catch(() => ({}));
        if (!adminRes.ok) {
          if (adminRes.status === 401) {
            logout();
            navigate('/', { state: { message: 'Session expired. Please login again.' } });
            return;
          }
          if (adminRes.status === 403) {
            logout();
            navigate('/', { state: { message: 'Unauthorized access. Admin privileges required.' } });
            return;
          }
          setError(adminJson?.message || 'Failed to load admin dashboard');
          return;
        }

        const authHeaders = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders', { headers: authHeaders }),
          fetch('/api/users', { headers: authHeaders }),
        ]);

        const [productsJson, ordersJson, usersJson] = await Promise.all([
          productsRes.json().catch(() => []),
          ordersRes.json().catch(() => []),
          usersRes.json().catch(() => []),
        ]);

        if (ordersRes.status === 401 || usersRes.status === 401) {
          logout();
          navigate('/', { state: { message: 'Session expired. Please login again.' } });
          return;
        }
        if (ordersRes.status === 403 || usersRes.status === 403) {
          logout();
          navigate('/', { state: { message: 'Unauthorized access. Admin privileges required.' } });
          return;
        }

        if (!ordersRes.ok) {
          setError(ordersJson?.message || 'Failed to load orders');
          return;
        }
        if (!usersRes.ok) {
          setError(usersJson?.message || 'Failed to load users');
          return;
        }

        const products = Array.isArray(productsJson) ? productsJson : [];
        const orders = Array.isArray(ordersJson) ? ordersJson : [];
        const users = Array.isArray(usersJson) ? usersJson : [];

        const lowStock = products
          .filter((p) => typeof p?.countInStock === 'number' && p.countInStock <= 5)
          .sort((a, b) => (a.countInStock ?? 0) - (b.countInStock ?? 0))
          .slice(0, 6);

        const recentOrders = orders
          .slice()
          .sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, 6);

        const pendingCount = orders.filter((o) => o?.orderStatus === 'Pending').length;
        const shippedCount = orders.filter((o) => o?.orderStatus === 'Shipped').length;
        const deliveredCount = orders.filter((o) => o?.orderStatus === 'Delivered').length;

        const totalSales = orders.reduce((sum, o) => {
          const v = typeof o?.totalPrice === 'number' ? o.totalPrice : 0;
          return sum + v;
        }, 0);

        setDashboard({
          admin: adminJson,
          products,
          orders,
          users,
          lowStock,
          recentOrders,
          totalSales,
          counts: {
            products: products.length,
            orders: orders.length,
            users: users.length,
            pendingOrders: pendingCount,
            shippedOrders: shippedCount,
            deliveredOrders: deliveredCount,
          },
        });
      } catch (e) {
        setError(e.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) load();
  }, [isLoading, logout, navigate, user?.token]);

  if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 24 }}>Please login to view the admin dashboard.</div>;

  return (
    <div className="container" style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff', position: 'sticky', top: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Admin</div>
          <div style={{ opacity: 0.8, marginBottom: 12 }}>{user?.name || user?.email}</div>

          <div style={{ display: 'grid', gap: 8 }}>
            <button className="modal-submit-btn" onClick={() => navigate('/admin/dashboard')}>Admin Dashboard</button>
            <button className="modal-submit-btn" onClick={() => navigate('/admin/login')}>Admin Login</button>
            <button className="modal-submit-btn" onClick={() => navigate('/admin/users')}>Manage Users</button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ marginBottom: 6 }}>Admin Dashboard</h1>
              <div style={{ opacity: 0.8 }}>Signed in as {user?.name || user?.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="modal-submit-btn" onClick={() => navigate('/admin')}>Go to Admin Panel</button>
              <button className="modal-submit-btn" style={{ backgroundColor: '#6c757d' }} onClick={() => window.location.reload()} disabled={loading}>Refresh</button>
            </div>
          </div>

          {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
          {loading && <div style={{ padding: 12 }}>Loading dashboard data...</div>}

          {dashboard && (
            <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff' }}>
              <div style={{ opacity: 0.7, marginBottom: 6 }}>Total Sales</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                ₹{Number(dashboard.totalSales || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>All orders</div>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff' }}>
              <div style={{ opacity: 0.7, marginBottom: 6 }}>Products</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{dashboard.counts.products}</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>Low stock: {dashboard.lowStock.length}</div>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff' }}>
              <div style={{ opacity: 0.7, marginBottom: 6 }}>Orders</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{dashboard.counts.orders}</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>
                Pending: {dashboard.counts.pendingOrders} | Shipped: {dashboard.counts.shippedOrders} | Delivered: {dashboard.counts.deliveredOrders}
              </div>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff' }}>
              <div style={{ opacity: 0.7, marginBottom: 6 }}>Users</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{dashboard.counts.users}</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>Registered accounts</div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 12,
            }}
          >
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff' }}>
              <h2 style={{ marginTop: 0 }}>Recent Orders</h2>
              {dashboard.recentOrders.length === 0 ? (
                <div style={{ opacity: 0.7 }}>No orders found.</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {dashboard.recentOrders.map((o) => (
                    <div key={o._id} style={{ border: '1px solid #f1f1f1', borderRadius: 8, padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600 }}>#{String(o._id).slice(-6)}</div>
                        <div style={{ opacity: 0.75 }}>{o.orderStatus || 'Unknown'}</div>
                      </div>
                      <div style={{ opacity: 0.8, marginTop: 6 }}>
                        Total: ₹{o.totalPrice ?? '-'}
                        {o.createdAt ? ` | ${new Date(o.createdAt).toLocaleString()}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 14, background: '#fff' }}>
              <h2 style={{ marginTop: 0 }}>Low Stock</h2>
              {dashboard.lowStock.length === 0 ? (
                <div style={{ opacity: 0.7 }}>No low stock items.</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {dashboard.lowStock.map((p) => (
                    <div key={p._id} style={{ border: '1px solid #f1f1f1', borderRadius: 8, padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ opacity: 0.8 }}>Stock: {p.countInStock}</div>
                      </div>
                      <div style={{ opacity: 0.75, marginTop: 6 }}>
                        Price: ₹{p.price ?? '-'}
                        {p.category ? ` | ${p.category}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          )}
        </div>
      </div>
    </div>
  );
}

