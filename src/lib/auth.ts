import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email and password
export const signUp = async ({ email, password, fullName }: SignUpData): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

// Sign in with email and password
export const signIn = async ({ email, password }: SignInData): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

// Sign in with magic link
export const signInWithMagicLink = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  return { error };
};

// Sign out
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Reset password request
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { error };
};

// Update password
export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
};

// Update user profile
export const updateProfile = async (updates: {
  full_name?: string;
  avatar_url?: string;
}): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  return { error };
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return subscription;
};

