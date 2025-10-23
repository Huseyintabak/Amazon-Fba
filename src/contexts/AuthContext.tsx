import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '../lib/auth';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  refreshSession: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const refreshSession = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      await loadProfile(currentUser.id);
    }
  };

  useEffect(() => {
    // Get initial user
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser.id);
      }
      setLoading(false);
    });

    // Listen to auth changes
    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

