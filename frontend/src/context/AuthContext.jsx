import { createContext, useContext, useState, useEffect } from 'react';
import { safeParseResponseJSON } from '../utils/jsonUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== '') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const signup = async (name, email, password, adminSecret) => {
    try {
      // Normal user register
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // allow HttpOnly cookie to be set
        body: JSON.stringify({ name, email, password }),
      });

      // Use safe JSON parsing utility
      const data = await safeParseResponseJSON(response, {});

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (!data || !data._id) {
        console.error('Invalid user data received:', data);
        throw new Error('Invalid server response');
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      // Use safe JSON parsing utility
      const data = await safeParseResponseJSON(response, {});
      
      if (!response.ok) {
        const errorMessage = data?.message || `Login failed (${response.status})`;
        console.error('Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data || !data._id) {
        console.error('Invalid user data received:', data);
        throw new Error('Invalid server response');
      }

      console.log('Login successful, user data:', data);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear server cookie (best effort); then clear local state.
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    signup,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
