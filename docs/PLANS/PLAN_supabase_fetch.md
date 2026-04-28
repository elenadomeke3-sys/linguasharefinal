# Pobieranie materiałów z bazy Supabase

## 1. Cel
Zastąpienie statycznej (mockowanej) tablicy materiałów w aplikacji dynamicznymi danymi pobieranymi bezpośrednio z bazy danych Supabase. Ożywienie katalogu materiałów.

## 2. Zakres
- **Wchodzi w zakres:** Pobieranie pełnej listy materiałów w `MaterialsPage.tsx`, pobieranie najnowszych materiałów na stronę główną `HomePage.tsx`, pobieranie pojedynczego materiału w `MaterialDetailPage.tsx`. Usunięcie sztucznych danych z pliku `src/data/materials.ts`.
- **Nie wchodzi w zakres:** Wdrożenie zaawansowanej wyszukiwarki pełnotekstowej bazującej na AI (to osobny feature).

## 3. Wymagania funkcjonalne
- Aplikacja pobiera wszystkie dostępne materiały z tabeli `materials` w Supabase i poprawnie wyświetla je na liście w katalogu.
- Strona ze szczegółami materiału pobiera dane po identyfikatorze `id` i obsługuje widok "nie znaleziono", gdy taki rekord nie istnieje w bazie.
- Istniejące w aplikacji mechanizmy filtrowania (po języku, poziomie, typie) nadal działają poprawnie, operując na pobranych danych.

## 4. Wymagania niefunkcjonalne
- **Wydajność:** Zapytania do bazy danych muszą zwracać tylko niezbędne pola (bądź być odpowiednio cachowane/przechowywane w stanie lokalnym komponentu).
- **UX:** Kiedy dane są w trakcie pobierania, użytkownik musi widzieć wskaźnik ładowania (spinner / szkielet komponentu).

## 5. Kontekst techniczny
- **API:** Klient `@supabase/supabase-js`, zapytania `supabase.from('materials').select('*')` oraz `supabase.from('materials').select('*').eq('id', id)`.
- **Interfejsy:** Typ `Material` (przepisany z wymogami nowych kolumn z bazy, np. camelCase na snake_case lub ich mapowanie).
- **Stan lokalny:** Obsługa ładowania i zapisywania wyników za pomocą hooków `useState` i `useEffect` wewnątrz komponentów widoków.

## 6. Kroki implementacji
1. Zmiana w `src/data/materials.ts` – usunięcie mockowanej tablicy `materials` i zachowanie/aktualizacja samego interfejsu (typu) `Material`.
2. Modyfikacja `MaterialsPage.tsx` do asynchronicznego pobierania listy z wykorzystaniem `useEffect`.
3. Modyfikacja `MaterialDetailPage.tsx` w celu pobierania konkretnego rekordu i pobierania adresu URL pliku (zastąpienie lokalnego generatora plików .txt).
4. Aktualizacja strony głównej `HomePage.tsx` oraz statystyk w `DashboardPage.tsx` i `UserProfilePage.tsx`.
5. Zaktualizowanie głównych rejestrów projektu.

## 7. Kryteria akceptacji
- Zmiany na stronie "Katalog materiałów" odzwierciedlają stan faktyczny tabeli z panelu Supabase.
- Użytkownik widzi materiał, który samodzielnie przed chwilą opublikował poprzez formularz uploadu.
- Pobranie materiału przez użytkownika ściąga faktycznie ten plik, który znajduje się w Supabase Storage (a nie sztucznie wygenerowany plik `.txt`).

## 8. Testy
- **Manualne:** Wgranie obrazka / dokumentu, przejście do katalogu, wejście w jego szczegóły i weryfikacja czy kliknięcie "Pobierz" pobiera właściwy plik z właściwą nazwą.