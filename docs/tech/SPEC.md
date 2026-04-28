# SPEC.md — LinguaShare AI Development

**Data:** 14 kwietnia 2026  
**Status:** Specyfikacja do implementacji  
**Wersja:** 1.0

---

## 1. Executive Summary

Ten dokument opisuje specyfikację funkcjonalności AI/ML dla platformy LinguaShare. Dokument obejmuje:

- Auto-tagging materiałów (klasyfikacja język, poziom, typ)
- System rekomendacji materiałów
- Plagiarism detection (wykrywanie duplikatów)
- Semantic search (wyszukiwanie semantyczne)

---

## 2. AI Features Specification

### 2.1 Auto-Tagging System

**Cel:** Automatyczne tagowanie materiałów przy uploadzie

#### Input

```typescript
interface AutoTagInput {
  title: string;
  description: string;
  fileContent?: string; // extracted text from PDF/DOCX
  fileName: string;
}
```

#### Output

```typescript
interface AutoTagOutput {
  language: string; // np. "angielski", "niemiecki"
  level: string; // np. "A1", "B2", "C1"
  type: string; // np. "WORKSHEET", "FLASHCARDS"
  confidence: number; // 0-1
  tags: string[]; // dodatkowe tagi
}
```

#### Implementation

- **Model:** OpenAI GPT-4o (lub Claude 3.5 Sonnet)
- **Prompt:** Zdefiniowany w `src/ai/prompts/auto-tag.ts`
- **Koszt szacunkowy:** ~$0.01 per materiał

#### Validation

- Walidacja wyniku przez użytkownika (edit przed publikacją)
- Human-in-the-loop: 10% losowa weryfikacja

---

### 2.2 Material Recommendation System

**Cel:** Rekomendowanie materiałów na podstawie zachowań użytkownika

#### Algorithm

```
1. Collaborative Filtering: similar users → similar materials
2. Content-Based: similar tags → similar materials
3. Popularity: trending materials in user's language
```

#### Input

```typescript
interface RecommendationInput {
  userId: string;
  viewedMaterials: string[]; // IDs
  downloadedMaterials: string[]; // IDs
  preferredLanguage: string;
  preferredLevel: string;
}
```

#### Output

```typescript
interface RecommendationOutput {
  recommendations: Material[];
  reason: string; // "Because you viewed X"
}
```

#### Implementation

- **Model:** Custom algorithm (nie wymaga LLM)
- **Storage:** PostgreSQL z wektorem embeddingów
- **Update:** Nightly batch job

---

### 2.3 Plagiarism Detection

**Cel:** Wykrywanie duplikatów i nieoryginalnych treści

#### Algorithm

```
1. Text extraction: PDF/DOCX → plain text
2. Embedding: text → vector (1536 dimensions)
3. Similarity search: cosine similarity > 0.85 → duplicate
4. Exact match: hash comparison for exact duplicates
```

#### Input

```typescript
interface PlagiarismCheckInput {
  materialId: string;
  fileUrl: string;
}
```

#### Output

```typescript
interface PlagiarismCheckOutput {
  isOriginal: boolean;
  duplicateOf?: string; // ID original material
  similarityScore: number; // 0-1
  flags: string[]; // ["exact_match", "high_similarity"]
}
```

#### Implementation

- **Embedding Model:** OpenAI text-embedding-3-small
- **Vector Storage:** Supabase pgvector
- **Koszt szacunkowy:** ~$0.0004 per materiał

---

### 2.4 Semantic Search

**Cel:** Wyszukiwanie po znaczeniu, nie tylko po słowach kluczowych

#### Algorithm

```
1. User query → embedding vector
2. Vector similarity search in pgvector
3. Rerank top 20 results by relevance
4. Return top 10 results
```

#### Implementation

- **Embedding Model:** OpenAI text-embedding-3-small
- **Search:** Supabase pgvector + hybrid search (keyword + vector)
- **Reranking:** bge-reranker-v2-m3 (opcjonalnie)

---

## 3. API Specification

### 3.1 Auto-Tag Endpoint

```typescript
// POST /api/ai/auto-tag
POST /api/ai/auto-tag
Content-Type: application/json

{
  "title": "Ćwiczenia na czas Present Perfect",
  "description": "Zestaw ćwiczeń z gramatyki angielskiej dla średniozaawansowanych",
  "fileName": "present-perfect-exercises.pdf"
}

// Response
{
  "language": "angielski",
  "level": "B1",
  "type": "WORKSHEET",
  "confidence": 0.92,
  "tags": ["gramatyka", "czasownik", "present-perfect"]
}
```

### 3.2 Recommendations Endpoint

```typescript
// GET /api/ai/recommendations?userId=xxx&limit=5
GET /api/ai/recommendations?userId=xxx&limit=5

// Response
{
  "recommendations": [
    {
      "id": "mat_123",
      "title": "Future Tense Exercises",
      "reason": "Similar to downloaded materials"
    }
  ]
}
```

### 3.3 Plagiarism Check Endpoint

```typescript
// POST /api/ai/plagiarism-check
POST /api/ai/plagiarism-check
Content-Type: application/json

{
  "materialId": "mat_123",
  "fileUrl": "https://storage.example.com/file.pdf"
}

// Response
{
  "isOriginal": true,
  "similarityScore": 0.12,
  "flags": []
}
```

---

## 4. Database Schema Extensions

### 4.1 Material Embeddings

```prisma
model MaterialEmbedding {
  id          String   @id @default(cuid())
  materialId  String   @unique
  embedding   Vector  // pgvector(1536)
  createdAt   DateTime @default(now())

  @@index([materialId])
}
```

---

## 5. Integration Points

### 5.1 Upload Flow (with AI)

```
1. User uploads file
2. Extract text from file
3. Call /api/ai/auto-tag
4. Pre-fill form with tags
5. User verifies/edits tags
6. User publishes
7. Background: generate embedding + store
8. Background: run plagiarism check
```

### 5.2 Search Flow (with AI)

```
1. User types query
2. If query > 3 words → semantic search
3. Else → keyword search
4. Merge and rank results
5. Return top 20
```

---

## 6. Security & Privacy

### 6.1 Data Handling

- **PII:** Nie przechowujemy danych osobowych w AI
- **Files:** Przetwarzamy lokalnie, nie wysyłamy do zewnętrznych API bez potrzeby
- **Logging:** Usuwamy logi po 30 dniach

### 6.2 Rate Limits

```typescript
const RATE_LIMITS = {
  "auto-tag": { limit: 100, window: "1m" },
  "plagiarism-check": { limit: 50, window: "1m" },
  recommendations: { limit: 200, window: "1m" },
  "semantic-search": { limit: 100, window: "1m" },
};
```

---

## 7. Cost Estimation

| Feature         | Requests/Month | Cost/Request | Monthly Cost   |
| --------------- | -------------- | ------------ | -------------- |
| Auto-Tag        | 1,000          | $0.01        | $10            |
| Plagiarism      | 500            | $0.0004      | $0.20          |
| Embeddings      | 2,000          | $0.0004      | $0.80          |
| Semantic Search | 10,000         | $0.0004      | $4             |
| **TOTAL**       |                |              | **~$15/month** |

---

## 8. Implementation Priority

| Priority | Feature              | Timeline    |
| -------- | -------------------- | ----------- |
| 1        | Auto-Tagging         | Sprint 3-4  |
| 2        | Semantic Search      | Sprint 5-6  |
| 3        | Plagiarism Detection | Sprint 7-8  |
| 4        | Recommendations      | Sprint 9-10 |

---

## 9. Monitoring

### 9.1 Metrics to Track

- AI response latency (target: < 2s)
- AI accuracy (human eval: 90%+)
- Cost per month
- Error rate

### 9.2 Alerts

- Latency > 5s
- Error rate > 5%
- Cost > $50/month

---

## 10. Next Steps

1. ✅ Specyfikacja utworzona
2. ⬜ Implementacja Auto-Tagging (Sprint 3)
3. ⬜ Implementacja Semantic Search (Sprint 5)
4. ⬜ Implementacja Plagiarism Detection (Sprint 7)
5. ⬜ Implementacja Recommendations (Sprint 9)

---

_Document created as part of Spec AI Development for LinguaShare_
