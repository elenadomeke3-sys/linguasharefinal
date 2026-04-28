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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  // Ustawiamy na true domyślnie, aby móc pokazać ekran ładowania podczas weryfikacji sesji
  isLoading: true, 

  initialize: () => {
    // 1. Sprawdzamy aktualną sesję przy pierwszym załadowaniu aplikacji
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });

    // 2. Nasłuchujemy na zmiany (np. kiedy użytkownik się zaloguje lub wyloguje)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });

    // Zwracamy funkcję czyszczącą na wypadek odmontowania nasłuchiwacza
    return () => subscription.unsubscribe();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));