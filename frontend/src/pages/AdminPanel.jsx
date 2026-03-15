import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Footer from '../components/Footer.jsx';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', category: '', price: 0, countInStock: 0, image: '', images: [],
  });

  // AdminRoute wrapper handles access control; this is a fallback for 403 from API
  const handleAuthError = (res) => {
    if (res?.status === 403) {
      logout();
      navigate('/', { state: { message: 'Unauthorized access. Admin privileges required.' } });
    }
  };

  const authHeader = { Authorization: `Bearer ${user?.token}`, 'Content-Type': 'application/json' };

  const loadProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };
  const loadOrders = async () => {
    const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${user.token}` } });
    handleAuthError(res);
    const data = await res.json();
    setOrders(data);
  };
  const loadUsers = async () => {
    const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${user.token}` } });
    handleAuthError(res);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    // AdminRoute ensures only admins reach here; check role for consistency
    const isAdmin = user?.role === 'admin' || user?.isAdmin;
    if (isAdmin) {
      loadProducts();
      loadOrders();
      loadUsers();
    }
  }, [user]);

  const handleProductCreate = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeader,
      body: JSON.stringify(productForm),
    });
    handleAuthError(res);
    if (res.ok) {
      setProductForm({ name: '', description: '', category: '', price: 0, countInStock: 0, image: '', images: [] });
      setEditingProduct(null);
      loadProducts();
    }
  };

  const handleProductSubmit = handleProductCreate;
  const handleProductEdit = (p) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, description: p.description || '', category: p.category || '', price: p.price || 0, countInStock: p.countInStock || 0, image: p.image || '', images: p.images || [] });
  };
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', category: '', price: 0, countInStock: 0, image: '', images: [] });
  };

  const handleProductDelete = async (id) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
    if (res.ok) loadProducts();
  };

  const handleOrderStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ status }),
    });
    if (res.ok) loadOrders();
  };

  const handleUserDelete = async (id) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
    if (res.ok) loadUsers();
  };

  const handleUserBlockToggle = async (u) => {
    const res = await fetch(`/api/users/${u._id}/block`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !u.isBlocked }),
    });
    if (res.ok) loadUsers();
  };

  const uploadImages = async (files) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('images', f));
    const res = await fetch('/api/upload/product', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token}` },
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      setProductForm((p) => ({ ...p, images: data.files, image: data.files[0] || '' }));
    }
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    const allowed = new Set(['products', 'orders', 'users']);
    if (tab && allowed.has(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  return (
    <>
      <div className="container" style={{ padding: '20px' }}>
        <h1>Admin Panel</h1>
        <div className="profile-tabs" style={{ marginBottom: '16px' }}>
          <button className={`profile-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
          <button className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={`profile-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        </div>

        {activeTab === 'products' && (
          <div>
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleProductSubmit} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={productForm.countInStock} onChange={(e) => setProductForm({ ...productForm, countInStock: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" />
                <div className="form-group" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Upload Images</label>
                <input type="file" multiple onChange={(e) => uploadImages(e.target.files)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="modal-submit-btn">{editingProduct ? 'Update' : 'Create'}</button>
                {editingProduct && (
                  <button type="button" className="modal-submit-btn" style={{ backgroundColor: '#6c757d' }} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2 style={{ marginTop: '24px' }}>Products</h2>
            <ul>
              {products.map((p) => (
                <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>{p.name} — ₹{p.price} — {p.countInStock} in stock</span>
                  <div>
                    <button onClick={() => handleProductEdit(p)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleProductDelete(p._id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2>Orders</h2>
            <ul>
              {orders.map((o) => (
                <li key={o._id} style={{ marginBottom: '8px' }}>
                  <div>Order: {o._id} — {o.orderStatus} — ₹{o.totalPrice}</div>
                  <div>
                    <button onClick={() => handleOrderStatus(o._id, 'Pending')}>Pending</button>
                    <button onClick={() => handleOrderStatus(o._id, 'Shipped')}>Shipped</button>
                    <button onClick={() => handleOrderStatus(o._id, 'Delivered')}>Delivered</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>Users</h2>
            <ul>
              {users.map((u) => (
                <li key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {u.name} — {u.email} {u.role === 'admin' || u.isAdmin ? '(Admin)' : ''} {u.isBlocked ? '(Blocked)' : ''}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(u.role !== 'admin' && !u.isAdmin) && (
                      <button onClick={() => handleUserBlockToggle(u)}>
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                    <button onClick={() => handleUserDelete(u._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}
