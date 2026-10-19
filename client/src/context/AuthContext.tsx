import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

export interface UserCoordinates {
  lat: number;
  lng: number;
  area?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  userLocation: string;
  userCoordinates: UserCoordinates | null;
  setUserLocation: (loc: string, coords?: UserCoordinates | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocationState] = useState<string>(
    localStorage.getItem('UserLocation') || 'Civil Lines, Rewa, Madhya Pradesh'
  );
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | null>(() => {
    const saved = localStorage.getItem('UserCoordinates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return { lat: 24.5373, lng: 81.2986, area: 'Civil Lines' };
  });

  const setUserLocation = (loc: string, coords?: UserCoordinates | null) => {
    setUserLocationState(loc);
    localStorage.setItem('UserLocation', loc);
    if (coords) {
      setUserCoordinates(coords);
      localStorage.setItem('UserCoordinates', JSON.stringify(coords));
    }
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed',
      };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await authService.register({ name, email, password, phone });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed',
      };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await authService.updateProfile(data);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Profile update failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        userLocation,
        userCoordinates,
        setUserLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

