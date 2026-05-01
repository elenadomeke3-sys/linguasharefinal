import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialize: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  let subscription: { unsubscribe: () => void } | null = null;

  return {
    user: null,
    session: null,
    isLoading: true,

    initialize: () => {
      // Jeśli już mamy subskrypcję, najpierw ją czyścimy
      if (subscription) {
        subscription.unsubscribe();
      }

      // Nasłuchujemy na zmiany sesji — callback wywoła się NATYCHMIAST z aktualnym stanem
      const { data: { subscription: newSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, isLoading: false });
      });

      subscription = newSubscription;
    },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false });
  },
  };
});