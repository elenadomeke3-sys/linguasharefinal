# LinguaShare — Platforma dla korepetytorów językowych

**Autor:** Elena Ewangelopulu  
**Data utworzenia:** 16 marca 2026  
**Status:** MVP gotowe do uruchomienia

**Link do strony** : [https://linguashare.vercel.app](https://linguashare.vercel.app)

## Pomysł

**LinguaShare** to platforma typu marketplace dla korepetytorów językowych, gdzie mogą dzielić się materiałami dydaktycznymi, znajdować gotowe zasoby i budować swoją profesjonalną bibliotekę.

### Problem

Korepetytorzy językowi tracą **2-5 godzin tygodniowo** na szukanie i tworzenie materiałów dydaktycznych od zera. Muszą:
- Przeszukiwać fragmentaryczne źródła (blogi, grupy FB, płatne platformy)
- Tworzyć wszystko samodzielnie
- Kupować pojedyncze materiały na zachodnich platformach ($5-20/materiał)

### Rozwiązanie

Centralizowana baza materiałów z systemem reputacji, filtrów i modelem "give-to-get" (oddaj 3 materiały, pobierz bez limitu) lub freemium.

---

## Funkcje Platformy

### Kategorie Materiałów

| Kategoria | Opis | Przykłady |
|-----------|-----|----------|
| **Testy** | Testy diagnostyczne, egzaminacyjne | Test poziomu A1, egzamin B2 |
| **Kartkówki** | Krótkie sprawdziany | Kartkówka z gramatyki |
| **Sprawdziany** | Większe prace klasowe | Sprawdzian z działu |
| **Słówka** | Fiszki i zestawy słów | 100 słów biznesowych |
| **Ćwiczenia** | Arkusze ćwiczeń | Present Perfect - 50 ćwiczeń |
| **Scenariusze lekcji** | Gotowe plany lekcji | Scenariusz na 90 minut |
| **Prezentacje** | Slajdy do lekcji | Prezentacja Colors |

### Języki

- 🇬🇧 Angielski
- 🇩🇪 Niemiecki
- 🇫🇷 Francuski
- 🇪🇸 Hiszpański
- 🇮🇹 Włoski
- 🇷🇺 Rosyjski
- 🇵🇱 Polski

### Poziomy (CEFR)

A1, A2, B1, B2, C1, C2

---

## Model Biznesowy

### Cennik

| Plan | Cena | Funkcje |
|------|------|---------|
| **Darmowy** | 0 PLN | 3 pobrania/miesiąc |
| **Premium** | 19 PLN/mies | Nielimitowane pobrania + kolekcje |
| **Team** | 79 PLN/mies | Dla szkół (5 osób) |

### Model "Give-to-Get"

Oddaj 3 materiały → dostajesz nielimitowane pobrania (zastępuje Premium)

---

## Tech Stack

- **Frontend:** React + TypeScript + TailwindCSS
- **Routing:** React Router v6
- **State:** Zustand (z persist)
- **Build:** Vite
- **Hosting:** Vercel (gotowe)

---

## Status Implementacji

✅ **Gotowe:**
- Katalog materiałów z filtrami (język, poziom, typ)
- Strona szczegółów z podglądem
- System logowania/rejestracji z Supabase
- **Resetowanie hasła (Zapomniałem hasła)**
- Upload materiałów z auto-tagging
- **Edycja materiałów przez autorów** (pełny CRUD)
- **Usuwanie materiałów przez autorów**
- Download z liczeniem limitu
- Dashboard użytkownika
- Strona cen
- System ocen i recenzji
- Pełna integracja z Supabase (baza + storage + auth)
- Wszystkie przyciski i opcje są klikalne i funkcjonalne

⏳ **Do dodania:**
- Płatności (Stripe)
- System kolekcji materiałów

---

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz: http://localhost:5173

Lub odwiedź wersję live: [https://linguashare.vercel.app](https://linguashare.vercel.app)

---

## 🔐 Konfiguracja Supabase Email (ważne!)

Aby funkcja **"Zapomniałem hasła"** działała, musisz skonfigurować wysyłkę email w Supabase:

### Krok 1: Włącz Email Auth w Supabase Dashboard
1. Wejdź na [supabase.com](https://supabase.com) → Dashboard → Twój projekt
2. Przejdź do **Authentication** → **Email Templates**
3. Upewnij się, że szablon **"Reset Password"** jest aktywny

### Krok 2: Skonfiguruj Site URL i Redirect URLs
1. **Settings** → **Authentication**
2. W polu **Site URL** wpisz: `https://linguashare.vercel.app`
3. W polu **Redirect URLs** dodaj:
   ```
   https://linguashare.vercel.app/reset-password
   https://linguashare.vercel.app/auth
   ```
4. Zapisz zmiany

### Krok 3: (Opcjonalnie) Potwierdź domenę
Supabase free tier blokuje wysyłkę emaili dla niepotwierdzonych domen. Aby to naprawić:

**Opcja A — Użyj Resend (darmowe 3000 emaili/miesiąc):**
1. Zarejestruj się na [resend.com](https://resend.com)
2. Dodaj domenę (lub użyj darmowej `resend.dev`)
3. W Supabase: **Settings** → **Email** → wybierz **Custom SMTP**
4. Wprowadź dane SMTP z Resend

**Opcja B — Potwierdź własną domenę:**
1. Dodaj własną domenę w Supabase → **Settings** → **Custom Domains**
2. Dodaj DNS records (TXT/CNAME) do swojego hosta
3. Po potwierdzeniu, Supabase będzie mógł wysyłać emaile

### Testowanie:
1. Otwórz `/auth` na stronie
2. Kliknij "Zapomniałeś hasła?"
3. Podaj email, którym się rejestrowałeś
4. Sprawdź SPAM jeśli nie ma maila

---

## 📁 Konfiguracja Supabase Storage (wymagana do uploadu)

Aby przesyłać pliki, musisz skonfigurować **Storage bucket**:

### Krok 1: Utwórz bucket `materials`
1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz projekt → **Storage** → **Buckets**
3. Kliknij **"Create bucket"**
   - **Name:** `materials`
   - **Public bucket:** `ON` (plików będą publicznie dostępne)
   - **File size limit:** `50MB` (opcjonalnie)
4. Kliknij **Create**

### Krok 2: Ustaw polityki RLS (Row Level Security)
Kliknij bucket `materials` → **Policies** → **Add policy**

Dodaj 2 polityki:

**a) Publiczny dostęp do odczytu (SELECT):**
```
Policy name: Public read access
Allowed operation: SELECT
Policy definition:
  CREATE POLICY "Public read access" ON storage.objects FOR SELECT
  USING (bucket_id = 'materials');
```

**b) Upload dla zalogowanych (INSERT):**
```
Policy name: Authenticated upload
Allowed operation: INSERT
Policy definition:
  CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');
```

---

## 🔐 **Konfiguracja RLS dla tabeli `materials` (wymagana do edycji/usuwania)**

Aby autorzy mogli edytować i usuwać swoje materiały, musisz włączyć **Row Level Security** na tabeli `materials` i dodać polityki:

### W SQL Editor (Supabase Dashboard):

```sql
-- Włącz RLS na tabeli materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Polityka: Publiczny dostęp do odczytu
CREATE POLICY "Public read materials" ON public.materials
  FOR SELECT USING (true);

-- Polityka: Zalogowani mogą dodawać swoje materiały
CREATE POLICY "Authenticated insert materials" ON public.materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- Polityka: Właściciel może edytować swoje materiały
CREATE POLICY "Owner can update materials" ON public.materials
  FOR UPDATE USING (auth.uid() = author_id);

-- Polityka: Właściciel może usuwać swoje materiały
CREATE POLICY "Owner can delete materials" ON public.materials
  FOR DELETE USING (auth.uid() = author_id);
```

Po dodaniu tych polityk:
- ✅ Każdy może przeglądać materiały (publiczne)
- ✅ Zalogowani mogą dodawać materiały (autor jest przypisany)
- ✅ Tylko autor może edytować/swój materiał
- ✅ Tylko autor może usunąć swój materiał

> ⚠️ **UWAGA:** Bez tych polityk upload zakończy się błędem "Permission denied".

### Krok 3: Włącz CORS (opcjonalnie, ale zalecane)
W bucketie → **Settings** → **CORS**:
```
Allowed origins: *
Allowed methods: GET, POST, PUT, DELETE, OPTIONS
Allowed headers: *
Max age: 3600
```

---

## 🚀 Wgranie na GitHub

### Krok 1: Przygotuj repozytorium
```bash
# Jeśli jeszcze nie masz repozytorium
git init
git add .
git commit -m "Initial commit: LinguaShare MVP"

# Dodaj remote (zmień na swoje dane)
git remote add origin https://github.com/TWOJ-NAZWA/linguashare.git
```

### Krok 2: Wypchnij na GitHub
```bash
# Wypchnij wszystkie zmiany
git push origin main

# Jeśli to pierwsze wypchnięcie
git push -u origin main
```

### Krok 3: Skonfiguruj GitHub Pages (opcjonalnie)
1. Wejdź w swoje repozytorium na GitHub
2. **Settings** → **Pages**
3. **Source**: wybierz "Deploy from a branch"
4. **Branch**: `main` i folder `/root`
5. **Save** - strona będzie dostępna pod `https://TWOJ-NAZWA.github.io/linguashare`

### Krok 4: Zmiene środowiskowe na GitHub
Jeśli hostujesz na GitHub Pages lub Vercel, dodaj zmienne środowiskowe:
- `VITE_SUPABASE_URL` - URL Twojego projektu Supabase
- `VITE_SUPABASE_ANON_KEY` - Klucz publiczny Supabase

---

## Kontakt

kontakt@linguashare.pl

---

*Projekt rozwijany z metodyką Architekt Biznesu SaaS*
