# Resetowanie Hasła (Forgot Password)

## 1. Cel
Umożliwienie użytkownikom odzyskania dostępu do konta w przypadku utraty hasła za pomocą mechanizmów Supabase Auth.

## 2. Zakres
- **Wchodzi w zakres:** Dodanie widoku "Zapomniałem hasła" w formularzu autoryzacji, wysyłanie e-maila z linkiem resetującym przez API Supabase.
- **Nie wchodzi w zakres:** Konfiguracja własnego, niestandardowego szablonu e-mail (korzystamy z domyślnego szablonu Supabase).

## 3. Wymagania funkcjonalne
- Użytkownik w widoku logowania może kliknąć "Zapomniałem hasła".
- Użytkownik podaje swój adres e-mail i klika przycisk wysyłania.
- Aplikacja informuje o pomyślnym wysłaniu linku.
- Po kliknięciu w link z maila, użytkownik wraca do aplikacji i może ustawić nowe hasło w panelu użytkownika.

## 4. Kontekst techniczny
- **API:** `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- **Pliki:** Modyfikacja `src/pages/AuthPage.tsx`.

## 5. Kroki implementacji
1. Dodanie stanów `isForgotPassword` oraz `resetEmailSent` do `AuthPage.tsx`.
2. Dodanie warunkowego renderowania formularza resetowania hasła (tylko pole e-mail).
3. Integracja funkcji wysyłającej z API Supabase.
4. Aktualizacja rejestrów SDD.

## 6. Kryteria akceptacji
- Kliknięcie "Zapomniałem hasła" przełącza widok.
- Wysłanie formularza skutkuje otrzymaniem e-maila od Supabase z linkiem pozwalającym na autologin i zmianę hasła.