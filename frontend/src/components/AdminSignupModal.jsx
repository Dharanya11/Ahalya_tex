import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  if (!isOpen) return null;

  const handleSwitch = (e) => {
    e.preventDefault();
    onClose();
    if (onSwitchToLogin) {
      setTimeout(() => onSwitchToLogin(), 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(name, email, password, adminSecret);
      onClose();
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAdminSecret('');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up as admin');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2 className="modal-title">Admin Sign Up</h2>
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="adminName">Full Name</label>
            <input 
              type="text" 
              id="adminName" 
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminEmail">Email</label>
            <input 
              type="email" 
              id="adminEmail" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminSecret">Admin Secret Key</label>
            <input 
              type="password" 
              id="adminSecret" 
              placeholder="Enter admin secret key"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input 
              type="password" 
              id="adminPassword" 
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminConfirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="adminConfirmPassword" 
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="modal-submit-btn">Sign Up as Admin</button>
          <p className="modal-footer-text">
            Already have an account? <span className="modal-link" onClick={handleSwitch}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}
