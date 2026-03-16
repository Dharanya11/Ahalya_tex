import { createContext, useContext, useState, useEffect } from 'react';

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

      // Safe JSON parsing with error handling
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Error parsing signup response:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
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
      console.log('Login response headers:', response.headers);

      // Safe JSON parsing with error handling
      let data;
      try {
        const text = await response.text();
        console.log('Login response text:', text);
        
        if (!text || text.trim() === '') {
          console.error('Empty response from server');
          throw new Error('Server returned empty response');
        }
        
        data = JSON.parse(text);
        console.log('Parsed login data:', data);
      } catch (parseError) {
        console.error('Error parsing login response:', parseError);
        console.error('Response was:', await response.clone().text());
        throw new Error('Invalid server response. Please try again.');
      }

      if (!response.ok) {
        const errorMessage = data?.message || `Login failed (${response.status})`;
        console.error('Login failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data || !data._id) {
        console.error('Invalid user data received:', data);
        throw new Error('Invalid user data received from server');
      }

      setUser(data);
      console.log('Login successful, user set:', data);
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
