# LinguaShare — Platforma dla korepetytorów językowych

**Autor:** Elena Ewangelopulu  
**Data utworzenia:** 16 marca 2026  
**Status:** MVP gotowe do uruchomienia
**Link do strony** : [https://linguashare.vercel.app](https://linguashare.vercel.app)---

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
- System logowania/rejestracji
- Upload materiałów z auto-tagging
- Download z liczeniem limitu
- Dashboard użytkownika
- Strona cen
- 16 przykładowych materiałów

⏳ **Do dodania:**
- Backend (Supabase/Firebase)
- Płatności (Stripe)
- Pełna weryfikacja email
- System ocen i komentarzy

---

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz: http://localhost:5173

Lub odwiedź wersję live: [https://linguashare.vercel.app](https://linguashare.vercel.app)

---

## Kontakt

kontakt@linguashare.pl

---

*Projekt rozwijany z metodyką Architekt Biznesu SaaS*
