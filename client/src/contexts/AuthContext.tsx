import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  register: (name: string, email: string, password: string, onSuccess?: () => void) => Promise<void>;
  logout: (onLogout?: () => void) => void;
  getCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:3001/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            const data = response.data;
            setUser(data);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to fetch user', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string, onSuccess?: () => void) => {
    console.log('AuthContext: login called');
    setError(null);
    try {
      console.log('Sending login request to server...');
      const API_BASE_URL = 'http://localhost:5000/api';
      console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      console.log('Login response:', response.data);
      
      const { token, userId } = response.data.data || {};
      
      if (!token || !userId) {
        throw new Error('Invalid response from server - missing token or userId');
      }
      
      console.log('Login successful, setting auth state');
      localStorage.setItem('token', token);
      setToken(token);
      
      // Fetch the user data after successful login
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('User data response:', userResponse.data);
      
      // The server returns { success: true, data: { user object } }
      const userData = userResponse.data?.data;
      if (!userData) {
        throw new Error('Failed to fetch user data after login');
      }
      
      const user = {
        _id: userData._id,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0] // Fallback to email prefix if name is not set
      };
      
      setUser(user);
      console.log('Auth state updated, calling onSuccess');
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      console.error('Login error:', { error: err, message: errorMessage });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, password: string, onSuccess?: () => void) => {
    console.log('AuthContext: register called');
    setError(null);
    try {
      console.log('Registering user:', { name, email });
      const API_BASE_URL = 'http://localhost:5000/api';
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      });
      
      console.log('Registration response:', response.data);
      
      const { token, userId } = response.data.data || {};
      
      if (!token || !userId) {
        throw new Error('Invalid response from server - missing token or userId');
      }
      
      localStorage.setItem('token', token);
      setToken(token);
      
      // Fetch the user data after successful registration
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('User data response after registration:', userResponse.data);
      
      // The server returns { success: true, data: { user object } }
      const userData = userResponse.data?.data;
      if (!userData) {
        throw new Error('Failed to fetch user data after registration');
      }
      
      const user = {
        _id: userData._id,
        email: userData.email,
        name: userData.name || name || userData.email.split('@')[0] // Use provided name, fallback to email prefix
      };
      
      setUser(user);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      console.error('Registration error:', { error: err, message: errorMessage });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = (onLogout?: () => void) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    onLogout?.();
  };

  const getCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:5000/api';
      console.log('Fetching user from:', `${API_BASE_URL}/auth/me`);
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // The server might wrap the user data in a data property
      const userData = response.data.data || response.data;
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      console.log('Fetched user data:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user', err);
      localStorage.removeItem('token');
      setToken(null);
      setError('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Only render children once loading is complete
  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      loading,
      error,
      getCurrentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>