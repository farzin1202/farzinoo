import { supabase } from './supabase';
import { User } from '../types';

export const loginWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // Redirect back to this page
    },
  });
  if (error) throw error;
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Trader',
    avatar: session.user.user_metadata.avatar_url || '',
  };
};
