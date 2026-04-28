# Zaimplementowane funkcjonalności

## Upload Materiałów
- status: DONE
- plan: PLAN_upload_material.md
- opis: Użytkownik może wgrać plik z zasobami dydaktycznymi, podać tytuł, język, poziom i typ. Obejmuje symulację Auto-Taggingu na podstawie tytułu pliku oraz mock dodawania do bazy danych. Zrealizowano w `src/pages/UploadPage.tsx`.

## Autoryzacja Supabase
- status: DONE
- plan: PLAN_supabase_auth.md
- opis: Rejestracja, logowanie i wylogowanie z użyciem Supabase Auth. Zabezpieczenie tras za pomocą `ProtectedRoute` i przeniesienie globalnego stanu sesji do Zustand (`authStore`). Zrealizowano w `src/pages/AuthPage.tsx`, `DashboardPage.tsx` i routerze wewnątrz `App.tsx`.

## Wgrywanie materiałów do Supabase
- status: DONE
- plan: PLAN_supabase_upload.md
- opis: Zastąpienie lokalnego stanu prawdziwym zapisem do Supabase. Wrzucanie plików do bucketa Storage i zapisywanie metadanych formularza do bazy danych PostgreSQL. Zrealizowano w `src/pages/UploadPage.tsx`.

## Pobieranie danych z Supabase (Fetch)
- status: DONE
- plan: PLAN_supabase_fetch.md
- opis: Usunięcie statycznych tablic mockowych. Integracja katalogu materiałów (`MaterialsPage.tsx`) z zapytaniami do bazy Supabase wraz z filtrowaniem. Zrealizowano dynamiczne statystyki w panelach.
