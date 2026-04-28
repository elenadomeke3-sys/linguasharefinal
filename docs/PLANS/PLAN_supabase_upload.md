# Integracja Uploadu z Supabase

## 1. Cel
Zastąpienie mockowanego dodawania materiałów prawdziwą integracją z bazą danych i dyskiem Supabase (Storage + Database).

## 2. Zakres
- **Wchodzi w zakres:** Wysyłanie pliku fizycznego do bucketa `materials`, zapis metadanych do tabeli `materials`, obsługa błędów, połączenie logiki z aktualnie zalogowanym użytkownikiem.
- **Nie wchodzi w zakres:** Pobieranie listy materiałów na stronie głównej (zostanie zrealizowane w osobnym planie).

## 3. Wymagania funkcjonalne
- Po kliknięciu "Opublikuj materiał", plik trafia do Supabase Storage.
- Aplikacja generuje publiczny URL do pliku.
- Aplikacja tworzy nowy wiersz w tabeli `materials` w Supabase, przypisując autorstwo do zalogowanego użytkownika.

## 4. Kontekst techniczny
- **API:** `@supabase/supabase-js` (`storage.from('materials').upload()`, `from('materials').insert()`).
- **Stan:** `useAuthStore` w celu weryfikacji tożsamości autora (`user.id`).

## 5. Kroki implementacji
1. Dodanie obsługi prawdziwego obiektu `File` w komponencie `UploadPage.tsx`.
2. Modyfikacja funkcji `handleSubmit` na asynchroniczną i wywołanie API Supabase.
3. Aktualizacja rejestrów SDD.
4. (Po stronie panelu Supabase): Utworzenie publicznego bucketa `materials` oraz tabeli `materials` z odpowiednimi kolumnami.

## 6. Kryteria akceptacji
- Zalogowany użytkownik wgrywa plik i po sukcesie, rekord pojawia się w Table Editor na stronie Supabase.
- Plik jest widoczny w sekcji Storage na koncie Supabase.