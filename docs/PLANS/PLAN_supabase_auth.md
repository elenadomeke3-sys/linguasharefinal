# Supabase Authentication

## 1. Cel
Wdrożenie prawdziwego systemu uwierzytelniania użytkowników za pomocą Supabase Auth (Email & Password), zastępując obecne mockowane logowanie w pamięci.

## 2. Zakres
- **Wchodzi w zakres:** Rejestracja e-mail/hasło, logowanie, wylogowanie, zabezpieczenie routing'u (Protected Routes), zarządzanie stanem sesji w Zustand.
- **Nie wchodzi w zakres:** Logowanie przez social media (Google, Facebook), resetowanie hasła (zapomniane hasło - zaplanowane na późniejszy etap).

## 3. Wymagania funkcjonalne
- Użytkownik może utworzyć nowe konto podając e-mail i hasło.
- Użytkownik może zalogować się na istniejące konto.
- Po pomyślnym zalogowaniu użytkownik zostaje przekierowany na stronę główną/dashboard.
- Aplikacja trzyma sesję użytkownika nawet po odświeżeniu strony.
- Widoki wymagające autoryzacji (np. `UploadPage`) są zablokowane dla niezalogowanych gości.

## 4. Wymagania niefunkcjonalne
- **Bezpieczeństwo:** Hasła i tokeny sesyjne bezpiecznie obsługiwane przez API Supabase (nigdy nie wypisywane w konsoli).
- **UX:** Wyraźne komunikaty błędów (np. "Nieprawidłowy e-mail lub hasło") oraz wskaźniki ładowania (spinner) podczas zapytań.

## 5. Kontekst techniczny
- **Komponenty:** Formularze rejestracji i logowania (`shadcn/ui` - Card, Input, Button).
- **API:** Klient `@supabase/supabase-js` (`signUp`, `signInWithPassword`, `signOut`).
- **Dane / Stan:** Zastąpienie/aktualizacja obecnego mocku w `Zustand` integracją ze zdarzeniami autoryzacji z Supabase.

## 6. Kroki implementacji
1. Instalacja paczki `@supabase/supabase-js`.
2. Konfiguracja klienta Supabase (`src/lib/supabase.ts`) przy użyciu zmiennych środowiskowych `.env`.
3. Aktualizacja globalnego stanu autoryzacji (Zustand), aby nasłuchiwał zmian sesji (`onAuthStateChange`).
4. Podpięcie formularza rejestracji pod akcje Supabase.
5. Podpięcie formularza logowania pod akcje Supabase.
6. Zabezpieczenie chronionych ścieżek za pomocą weryfikacji tokenu (np. z użyciem `<ProtectedRoute />`).

## 7. Kryteria akceptacji
- Po wypełnieniu formularza rejestracji użytkownik pojawia się w sekcji "Authentication" w panelu webowym Supabase.
- Pomyślne zalogowanie poprawnie odblokowuje dostęp do widoków chronionych.
- Odświeżenie strony przeglądarki po zalogowaniu nie powoduje wylogowania użytkownika.

## 8. Testy
- **Manualne:** Próba bezpośredniego wejścia na chronioną stronę przez niezalogowanego użytkownika wymusza przekierowanie do widoku `/login`.