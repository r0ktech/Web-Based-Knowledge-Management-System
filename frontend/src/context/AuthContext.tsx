'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export type UserRole = 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'RESEARCHER' | 'HISTORIAN' | 'EDITOR' | 'CONTRIBUTOR' | 'GUEST';

export interface UserProfile {
  stateOfOrigin?: string;
  lga?: string;
  biography?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string, lga?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: { name: string; stateOfOrigin?: string; lga?: string; biography?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleInit = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        // Attempt verifying via API silently
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          console.warn('Auth validation failed. Using local storage copy.', e);
        }
      }
      setLoading(false);
    };

    handleInit();
  }, [API_URL]);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: accessToken, user: userData } = res.data;

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error: any) {
      // Offline fallback for development mockup convenience
      if (!error.response) {
        console.warn('Backend is offline. Falling back to local visual authentication bypass.');
        let role: UserRole = 'GUEST';
        let name = 'Guest Historian';
        
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('superadmin')) {
          role = 'SUPER_ADMIN';
          name = 'Chief Administrator (Super)';
        } else if (lowerEmail.includes('admin')) {
          role = 'ADMINISTRATOR';
          name = 'Alhaji Victor Kalu (Admin)';
        } else if (lowerEmail.includes('historian')) {
          role = 'HISTORIAN';
          name = 'Dr. Chinwe Mba (Historian)';
        } else if (lowerEmail.includes('researcher')) {
          role = 'RESEARCHER';
          name = 'Prof. Obinna Nwosu (Researcher)';
        } else if (lowerEmail.includes('contributor')) {
          role = 'CONTRIBUTOR';
          name = 'Chidi Okereke (Contributor)';
        }

        const mockUser: User = {
          id: 'mock-user-uuid',
          email,
          name,
          role,
          profile: {
            stateOfOrigin: 'Abia State',
            lga: 'Umuahia North',
            biography: 'Mock User Account used during offline testing mode.',
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`
          }
        };

        setToken('mock-jwt-token');
        setUser(mockUser);
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return;
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role?: string, lga?: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        stateOfOrigin: 'Abia State',
        lga
      });
      const { token: accessToken, user: userData } = res.data;

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error: any) {
      if (!error.response) {
        // Mock register bypass
        const mockUser: User = {
          id: 'mock-user-registered',
          email,
          name,
          role: (role as UserRole) || 'CONTRIBUTOR',
          profile: {
            stateOfOrigin: 'Abia State',
            lga: lga || 'Aba North',
            biography: 'New account registered.',
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`
          }
        };
        setToken('mock-jwt-token');
        setUser(mockUser);
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return;
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const updateProfile = async (profileData: { name: string; stateOfOrigin?: string; lga?: string; biography?: string }) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      if (!error.response && user) {
        const updated = {
          ...user,
          name: profileData.name,
          profile: {
            ...user.profile,
            stateOfOrigin: profileData.stateOfOrigin,
            lga: profileData.lga,
            biography: profileData.biography
          }
        };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return;
      }
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
