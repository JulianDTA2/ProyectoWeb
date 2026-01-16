import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';

// Interfaces basadas en tu código Vue
interface User {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Equivalente a la acción fetchProfile de Pinia
  const fetchProfile = async () => {
    try {
      const response = await api.get<User>('/profile'); // Endpoint según tu store de Vue
      setUser(response.data);
    } catch (e) {
      console.error("Error fetching profile", e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      // fetchProfile se ejecutará automáticamente por el useEffect
      return true;
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    setError(null);
    try {
      await api.post('/users/register', data);
      await login({ email: data.email, password: data.password });
      return true;
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al registrarse');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'admin',
      error,
      loading,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};