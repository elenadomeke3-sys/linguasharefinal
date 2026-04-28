import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { useAuthStore } from './authStore';

interface ExtendedUser extends User {
  name: string;
  avatar: string | null;
  isPremium: boolean;
}

interface UserState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  logout: () => Promise<void>;
  getAvailableDownloads: () => number;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isPremium: false,

  logout: async () => {
    const authStore = useAuthStore.getState();
    await authStore.signOut();
    set({ user: null, isAuthenticated: false, isPremium: false });
  },

  getAvailableDownloads: () => {
    const { user, isPremium } = get();
    if (!user) return 0;
    return isPremium ? -1 : 3;
  },
}));

// Subscribe to auth store changes and sync state
useAuthStore.subscribe((state) => {
  const rawUser = state.user;
  const isPremium = rawUser?.user_metadata?.is_premium || false;
  const extendedUser: ExtendedUser | null = rawUser
    ? {
        ...rawUser,
        name: rawUser.user_metadata?.full_name || "Użytkownik",
        avatar: rawUser.user_metadata?.avatar_url || null,
        isPremium,
      }
    : null;

  useUserStore.setState({
    user: extendedUser,
    isPremium,
    isAuthenticated: rawUser !== null,
  });
});
