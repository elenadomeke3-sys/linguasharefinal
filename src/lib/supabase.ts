import { createClient } from '@supabase/supabase-js';

// Pobieramy klucze z pliku .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Brak zmiennych środowiskowych Supabase! Upewnij się, że plik .env zawiera:');
  console.error('   VITE_SUPABASE_URL=...');
  console.error('   VITE_SUPABASE_ANON_KEY=...');
}

// Eksportujemy gotowego klienta
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Debugowanie - pokażemy błędy Supabase w konsoli (tylko w dev)
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event, session?.user?.email);
  });
}
