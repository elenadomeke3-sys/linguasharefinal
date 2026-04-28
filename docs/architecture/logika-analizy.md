# Logika Analizy — LinguaShare

**Data:** 16 kwietnia 2026

---

## Cel Dokumentu

Definicja logiki działania produktu: reguły typów materiałów, mikroakcje użytkownika, scoring, systemy rankingowe i edge case'y. Ten dokument jest referencją dla developera implementującego produkt.

---

## 1. Typy Materiałów (Taxonomia)

### 1.1 Wymagane Pola (Schema)

Każdy materiał musi mieć:

| Pole | Typ | Wymagane | Przykład |
|------|-----|----------|----------|
| `language` | string | TAK | "angielski", "niemiecki", "hiszpański" |
| `level` | enum | TAK | "A1", "A2", "B1", "B2", "C1", "C2" |
| `type` | enum | TAK | "WORKSHEET", "FLASHCARDS", "TEST", "LESSON_PLAN", "PRESENTATION", "AUDIO", "VIDEO" |
| `title` | string | TAK | max 200 znaków |
| `description` | string | NIE | max 2000 znaków |
| `fileUrl` | string | TAK | URL do pliku w storage |
| `fileFormat` | enum | TAK | "PDF", "DOCX", "JPG", "PNG" |
| `price` | number | TAK | 0 = darmowy |
| `authorId` | string | TAK | FK do users |
| `isPremium` | boolean | NIE | false (domyślnie) |
| `createdAt` | timestamp | TAK | auto |

### 1.2 Reguły Walidacji (Upload)

```
REGUŁA-1:Plik musi być PDF, DOCX, JPG lub PNG
  → Jeśli inny: REJECT z komunikatem "Nieobsługiwany format"

REGUŁA-2: Rozmiar pliku musi być między 1KB a 50MB
  → Jeśli za mały: REJECT "Plik za mały"
  → Jeśli za duży: REJECT "Plik przekracza limit 50MB"

REGUŁA-3: Język musi być z listy DOZWOLONYCH
  → Lista: angielski, niemiecki, hiszpański, francuski, włoski, rosyjski, polski, portugalski, chiński, japoński, koreański
  → Jeśli inny: REJECT "Nieobsługiwany język"

REGUŁA-4: Poziom musi być z listy DOZWOLONYCH (CEFR)
  → Lista: A1, A2, B1, B2, C1, C2
  → Jeśli inny: REJECT "Niepoprawny poziom"

REGUŁA-5: Typ musi być z listy DOZWOLONYCH
  → Lista: WORKSHEET, FLASHCARDS, TEST, LESSON_PLAN, PRESENTATION, AUDIO, VIDEO
  → Jeśli inny: REJECT "Niepoprawny typ materiału"
```

### 1.3 Auto-Tagging (Dla MVP: opcjonalne)

**Input dla auto-tag:**
```json
{
  "title": "Present Perfect exercises for B1",
  "description": "50 exercises to practice Present Perfect tense",
  "fileName": "present-perfect-b1.pdf"
}
```

**Logika auto-tag:**
```
JEŚLI title zawiera "A1" LUB "A2" → level = A1/A2
JEŚLI title zawiera "B1" LUB "B2" → level = B1/B2
JEŚLI title zawiera "C1" LUB "C2" → level = C1/C2
JEŚLI title zawiera "worksheet" LUB "exercises" → type = WORKSHEET
JEŚLI title zawiera "flashcard" LUB "fiszki" → type = FLASHCARDS
JEŚLI title zawiera "test" LUB "quiz" → type = TEST
JEŚLI title zawiera "lesson" LUB "plan" → type = LESSON_PLAN

DLA JEZYKA: (uproszczony - bez NLP)
JEŚLI fileName zawiera "english" LUB "angielski" → language = angielski
JEŚLI fileName zawiera "german" LUB "niemiecki" → language = niemiecki
...

confidence = 0.5 (niska pewność przy auto-tag)
USER MUSI POTWIERDZIĆ PRZED PUBLIKACJĄ
```

---

## 2. System Pobierania i Limity

### 2.1 Logika Free Tier

```
FREE TIER:
├── 3 pobrania / miesiąc kalendarzowy
├── Reset: 1-go dnia każdego miesiąca o 00:00 UTC
├── Po przekroczeniu: blokada pobierania + CTA do upgrade
└── Przeglądanie: BEZ OGRANICZEŃ

PREMIUM TIER:
├── Pobrania bez limitu
├── Wszystkie funkcje dostępne
└─�� Kolekcje bez limitu
```

### 2.2 Implementacja Download Counter

**Tabela w bazie:**
```prisma
model Download {
  id          String   @id @default(cuid())
  userId      String
  materialId String
  downloadedAt DateTime @default(now())
  
  @@unique([userId, downloadedAt]) // nie, można wielokrotnie
}
```

**Query do sprawdzenia limitu:**
```sql
-- Sprawdź ile pobrań w bieżącym miesiącu
SELECT COUNT(*) as downloads_this_month
FROM downloads
WHERE user_id = :userId
  AND downloaded_at >= date_trunc('month', CURRENT_DATE);
```

**Logika przy kliknięciu "Pobierz":**
```
1. Pobierz user.isPremium
   → JEŚLI true: pozwól pobrać (presigned URL)
   
2. JEŚLI false:
   a) Pobierz count downloads_this_month
   b) JEŚLI count >= 3:
        → Zablokuj pobieranie
        → Pokaż komunikat: "Osiągnąłeś limit 3 pobrań w tym miesiącu"
        → Pokaż CTA "Zaktualizuj do Premium"
        → NIE loguj do tabeli downloads
   c) JEŚLI count < 3:
        → Pozwól pobrać
        → Zaloguj do tabeli downloads (count + 1)
        → Pokaż "Pozostało X pobrań"
```

### 2.3 Edge Cases dla Downloads

| Edge Case | Obsługa |
|-----------|---------|
| **Użytkownik pobiera ten sam materiał wielokrotnie** | Licz jako osobne pobranie (może być użyteczne dla ucznia) |
| **Reset w trakcie pobierania** | Timestamp zapisany PRZED rozpoczęciem, więc liczy się do poprzedniego miesiąca |
| **Użytkownik upgrade w trakcie miesiąca** | Od razu ma unlimited - nie ma refundu za niewykorzystane pobrania |
| **Mass download attempt (10+ w 1 min)** | Rate limit: max 5 pobrań/minutę/IP |
| **Preview materiału bez pobierania** | Dostępne - detail view pokazuje pierwszą stronę (jeśli PDF) lub thumbnail |

---

## 3. System Ocen i Ranking

### 3.1 Logika Oceniania

```
OCENA: 1-5 gwiazdek
  → Tylko po pobraniu materiału (musisz miećDownload.record)
  → Jeden głos na materiał na użytkownika
  → Można zmienić ocenę (UPDATE)
  → Komentarz opcjonalny (max 500 znaków)
```

**Tabela:**
```prisma
model Rating {
  id         String   @id @default(cuid())
  stars      Int      // 1-5
  comment    String?   // max 500
  userId     String
  materialId String
  createdAt DateTime @default(now())
  
  @@unique([userId, materialId]) // jeden głos per materiał
}
```

### 3.2 Średnia Oceny

```sql
-- Średnia ocena materiału
SELECT 
  material_id,
  COUNT(*) as rating_count,
  AVG(stars)::numeric(2,1) as average_rating
FROM ratings
GROUP BY material_id;

-- Przykład wyniku:
-- material_id | rating_count | average_rating
-- ------------|--------------|----------------
-- mat_123     | 15           | 4.2
```

### 3.3 Algorytm Rankingowy

**Sortowanie w katalogu:**
```
DOMYŚLNE: Najnowsze (createdAt DESC)

OPCJE SORTOWANIA:
├── Najnowsze (createdAt DESC)
├── Najpopularniejsze (downloads_count DESC)
├── Najwyżej oceniane (average_rating DESC)
├── Najwięcej ocen (rating_count DESC)
└── Tytuł (title ASC)

FILTROWANIE: (kombinacja AND)
├── language = "angielski"
├── level = "B1"
└── type = "WORKSHEET"
```

**Wzór popularności (dla rekomendacji):**
```
popularity_score = 
  (downloads_count * 1.0) + 
  (rating_count * 2.0) + 
  (average_rating * 10.0)
```

---

## 4. Mikroakcje i Gamefication

### 4.1 User Flow Mikroakcje

```
SCENARIUSZ: Użytkownik znalazł materiał

KROK 1: Browse/Search
  → Widzi listę materiałów z gwiazdkami
  → Mikroakcja: "Jak oceniają inni?"

KROK 2: View Detail
  → Widzi: tytuł, opis, autor, ocena, format
  → Mikroakcja: "Czy warto pobrać?"

KROK 3: Download (jeśli limit pozwala)
  → Pobieranie rozpoczyna się
  → Mikroakcja: "Pobieranie zaliczone!"
  → System: loguj do downloads

KROK 4: Post-Download (opcjonalne)
  → Komunikat: "Oceń ten materiał"
  → Link do rating form
  → Mikroakcja: "Twoja opinia się liczy!"
```

### 4.2 Komunikaty Systemowe

| Moment | Komunikat | Typ |
|--------|----------|-----|
| Po zalogowaniu | "Masz 2 pobrania w tym miesiącu" | info |
| Przed limitem (1 left) | "Zostało 1 pobranie tego miesiąca" | warning |
| Po przekroczeniu | "Osiągnąłeś limit. Zaktualizuj do Premium" | error |
| Po ocenie | "Dziękujemy za opinię!" | success |
| Po uploadzie | "Materiał dodany! Widoczny w katalogu" | success |
| Przy uploadzie (nowy) | "Oddaj 1 materiał, zyskaj +1 download" | promo |

### 4.3 Give-to-Get Mechanic (Prosta Wersja)

```
LOGIKA: Za każdy opublikowany materiał +1 dodatkowe pobranie

Tabela:
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  bonusDownloads Int    @default(0)  // dodatkowe pobrania za oddane materiały
  materialsUploaded Int @default(0)   // licznik oddanych materiałów
}
```

**Logika:**
```
PRZY PUBLIKACJI MATERIAŁU:
1. user.materialsUploaded += 1
2. user.bonusDownloads += 1
3. Komunikat: "Dziękujemy! Masz +1 bonusowe pobranie"

PRZY POBIERANIU:
1. Pobierz count downloads_this_month
2. Odejmij bonusDownloads od dostępnego limitu
   → effective_limit = 3 + bonusDownloads
   → available = effective_limit - downloads_this_month
3. JEŚLI available > 0: pozwól
   INACZEJ: blokada + upgrade CTA
```

---

## 5. Moderacja i Anty-Troll

### 5.1 Reguły Anty-Troll

| Reguła | Warunek | Akcja |
|-------|---------|-------|
| **Rate Limit Upload** | > 5 uploadów/dzień dla nowego użytkownika | BLOKUJ + flag do manual review |
| **File Validation** | nie PDF/DOCX/JPG/PNG | REJECT |
| **File Size** | < 1KB lub > 50MB | REJECT |
| **CAPTCHA** | 3+ uploadów tego samego dnia | WYMAGAJ |
| **Suspicious Name** | nazwa pliku zawiera "crack", "keygen", "serial" | REJECT + flag |
| **Report Threshold** | 3+ reportów na materiał | AUTO-HIDE + flag do review |
| **User Blacklist** | 5+ zgłoszeń na użytkownika | AUTO-BAN |

### 5.2 Upload Flow z Moderacją

```
1. Upload pliku
   ↓
2. File validation (format, size, name)
   ↓ [FAIL] → komunikat błędu
   ↓ [PASS]
3. CAPTCHA (jeśli > 3 uploadów/dzień)
   ↓ [FAIL] → wymagaj rozwiązania
   ↓ [PASS]
4. Save do temp storage
   ↓
5. User wypełnia formularz (title, tags)
   ↓
6. Preview przed publikacją
   ↓
7. User klika "Opublikuj"
   ↓
8. SAVE do materials (status = pending_review LUB published)
   → MVP: losowy 10% idzie do manual review
   → Reszta: published od razu
```

### 5.3 Report System

```
REPORT TYPU:
├── "Nieodpowiednie treści"
├── "Błąd w materiałe"
├── "Piractwo / naruszenie praw"
├── "Duplikat"
└── "Inne"

PRZY 3+ REPORTS:
→ Materiał ukryty (nie widać w search)
→ Flag do manual review
→ Jeśli review = spam: USUŃ
→ Jeśli review = ok: PRzywróć
```

---

## 6. Scoring i Metryki

### 6.1 Time-to-Value Metrics

| Metric | Definicja | Target |
|--------|----------|--------|
| **Time to first download** | Od sign-up do pierwszego pobrania | < 5 min |
| **Time to first value** | Od wejścia na stronę do pierwszego pobrania | < 2 min |
| **Search success rate** | % wyszukań z ≥1 wynikiem | > 80% |
| **Download completion rate** | % kliknięć pobieranie > udane pobranie | > 95% |

### 6.2 Engagement Metrics

| Metric | Definicja | Target |
|--------|----------|--------|
| **Activation rate** | % sign-up z ≥1 pobraniem | > 50% |
| **Retention (7-day)** | % users aktywnych 7 dni po pierwszym użyciu | > 40% |
| **Retention (30-day)** | % users aktywnych 30 dni po pierwszym użyciu | > 25% |
| **Upload rate** | % users z ≥1 uploadem | > 20% |
| **Rating rate** | % users którzy ocenili materiał | > 15% |

### 6.3 Business Metrics (Post-MVP)

| Metric | Definicja | Target |
|--------|----------|--------|
| **Free → Paid conversion** | % free users którzy kupili Premium | > 5% |
| **CAC** | Koszt pozyskania płacącego użytkownika | < 30 PLN |
| **LTV** | Lifetime Value płacącego użytkownika | > 300 PLN |
| **LTV:CAC ratio** | LTV / CAC | > 3:1 |

---

## 7. Edge Cases - Pełna Lista

### 7.1 Edge Cases: Downloads

| # | Edge Case | Rozwiązanie |
|---|----------|-------------|
| E1 | User pobiera 3 materiały, potem kupuje Premium tego samego dnia | Od razu ma unlimited - nie liczy się do poprzedniego limitu |
| E2 | Download timeout (plik > 10MB na wolnym łączu | Timeout po 60s, user może spróbować ponownie |
| E3 | User usunął konto po 2 pobraniach tego miesiąca | Pobrania się "liczą" ale konto = gone |
| E4 | Przełom miesiąca podczas pobierania | Timestamp zapisywany PRZED startem download |

### 7.2 Edge Cases: Upload/Content

| # | Edge Case | Rozwiązanie |
|---|----------|-------------|
| E5 | Materiał bez tytułu | WYMAGAJ tytułu przed publish |
| E6 | Materiał z pustym opisem | DOZWOL (optional) |
| E7 | Duplikat tytułu (inny plik) | WARN ale pozwól (mogą być podobne) |
| E8 | Materiał z nieznanym językiem (np. suahili) | REJECT z komunikatem "Wybierz język z listy" |
| E9 | User uploaduje 6ty materiał tego samego dnia | Rate limit block + komunikat |
| E10 | Materiał ma 0 ocen, jak sortować? | Sortuj jako last (na dole) |

### 7.3 Edge Cases: Rating

| # | Edge Case | Rozwiązanie |
|---|----------|-------------|
| E11 | User ocenia bez pobrania | REJECT (nie ma Download.record) |
| E12 | User chce ocenić bez logowania | Wymagaj logowania |
| E13 | User ocenia swoj własny materiał | DOZWOL (nie ma ograniczeń) |
| E14 | Materiał usunięty, oceny zostają | Oceny orphan ale nie widoczne (material_id = null lub soft delete) |

### 7.4 Edge Cases: Auth/Account

| # | Edge Case | Rozwiązanie |
|---|----------|-------------|
| E15 | User zapomniał hasła | Reset token ważny 24h |
| E16 | User zmienia email | Wymagaj weryfikacji nowego email |
| E17 | User konto usunięte (GDPR) | Soft delete - dane wrażliweusuwane, materiały zachowane (author = anonymized) |
| E18 | Duplicate email przy signup | Error "Email już istnieje" |

---

## 8. Database Schema (Final)

```prisma
// Full schema dla developera

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  name             String?
  avatar           String?
  passwordHash     String
  isPremium        Boolean  @default(false)
  premiumExpiresAt  DateTime?
  credits          Int      @default(3)      // 3 + bonus
  bonusDownloads   Int      @default(0)
  materialsUploaded Int    @default(0)
  isActive         Boolean  @default(true)
  isBanned         Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  materials        Material[]
  ratings          Rating[]
  downloads       Download[]
  collections     Collection[]
}

model Material {
  id           String   @id @default(cuid())
  title        String
  description String?
  fileUrl      String
  fileFormat   String
  language    String
  level       String
  type        String
  price       Float    @default(0)
  isPremium   Boolean  @default(false)
  authorId    String
  isPublished Boolean  @default(true)
  isFlagged    Boolean  @default(false)
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author       User     @relation(fields: [authorId], references: [id])
  ratings      Rating[]
  downloads   Download[]
  collectionItems CollectionItem[]
}

model Rating {
  id         String   @id @default(cuid())
  stars      Int
  comment   String?
  userId     String
  materialId String
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])
  material   Material @relation(fields: [materialId], references: [id])

  @@unique([userId, materialId])
}

model Download {
  id          String   @id @default(cuid())
  userId      String
  materialId  String
  downloadedAt DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  material   Material @relation(fields: [materialId], references: [id])
}

model Collection {
  id          String   @id @default(cuid())
  name       String
  userId     String
  isPublic   Boolean  @default(false)
  createdAt  DateTime @default(now())

  user        User             @relation(fields: [userId], references: [id])
  items       CollectionItem[]
}

model CollectionItem {
  id            String   @id @default(cuid())
  collectionId String
  materialId   String
  position    Int      @default(0)
  addedAt     DateTime @default(now())

  collection  Collection @relation(fields: [collectionId], references: [id])
  material   Material   @relation(fields: [materialId], references: [id])

  @@unique([collectionId, materialId])
}
```

---

## 9. Checklist Implementacyjny

- [ ] User model z credit systemem
- [ ] Material model z required fields
- [ ] Download query z monthly reset
- [ ] Download counter enforcement (limit 3)
- [ ] Rating system (1-5 gwiazdek)
- [ ] Rating uniqueness (1 per user per material)
- [ ] Material search z filtrami
- [ ] Material sort (newest, popular, rating)
- [ ] Collection model
- [ ] Collection items
- [ ] Rate limit upload (5/dzień)
- [ ] File validation (format, size)
- [ ] Report system
- [ ] User ban logic

---

## 10. API Endpoints Referencja

| Endpoint | Metoda | Opis |
|----------|-------|------|
| `/api/materials` | GET | Lista z filtrami |
| `/api/materials/:id` | GET | Detail materiału |
| `/api/materials` | POST | Dodaj materiał (auth required) |
| `/api/materials/:id/download` | POST | Pobierz materiał |
| `/api/materials/:id/rate` | POST | Oceń materiał |
| `/api/collections` | GET | Lista kolekcji usera |
| `/api/collections` | POST | Utwórz kolekcję |
| `/api/collections/:id/items` | POST | Dodaj do kolekcji |
| `/api/user/me` | GET | Profil usera |
| `/api/user/me` | PATCH | Aktualizuj profil |

---

*Document created as product logic reference for LinguaShare implementation*