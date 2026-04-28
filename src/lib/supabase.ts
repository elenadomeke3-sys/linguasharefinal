import { createClient } from '@supabase/supabase-js';

// Pobieramy klucze z pliku .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Brakuje zmiennych środowiskowych Supabase! Upewnij się, że masz plik .env z VITE_SUPABASE_URL oraz VITE_SUPABASE_ANON_KEY');
}

// Eksportujemy gotowego klienta, którego będziemy używać do logowania i pobierania danych
export const supabase = createClient(
  supabaseUrl || 'https://twoj-projekt.supabase.co',
  supabaseAnonKey || 'twoj-anon-key'
);
