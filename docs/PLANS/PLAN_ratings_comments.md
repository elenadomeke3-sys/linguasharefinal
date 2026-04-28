# System Oceny i Komentarzy (Ratings & Comments)

## 1. Cel
Dodanie możliwości oceniania materiałów (1-5 gwiazdek) oraz dodawania komentarzy przez zalogowanych użytkowników. Każdy użytkownik może ocenić i skomentować materiał, a średnia ocena jest wyświetlana w katalogu i na stronie szczegółów.

## 2. Zakres
- **Wchodzi w zakres:** Tabela `reviews` w Supabase, formularz oceny/komentarza pod materiałem, wyświetlanie listy komentarzy, obliczanie średniej oceny.
- **Nie wchodzi w zakres:** Edycja/usuwanie komentarzy przez innych użytkowników, system polubień, odpowiedzi na komentarze (threads).

## 3. Wymagania funkcjonalne
- Użytkownik zalogowany może ocenić materiał (1-5 gwiazdek)
- Użytkownik zalogowany może dodać komentarz (opcjonalnie)
- Użytkownik może zmienić swoją ocenę/komentarz (edycja)
- Średnia ocena i liczba ocen są wyświetlane w katalogu i na stronie szczegółów
- Lista komentarzy wyświetlana pod materiałem (najnowsze pierwsze)
- Jeden użytkownik — jedna ocena na materiał

## 4. Kontekst techniczny
- **Baza danych:** Tabela `reviews` w Supabase z Foreign Key do `materials` i `auth.users`
- **API:** Supabase JS client (`from('reviews').select()`, `.insert()`, `.update()`)
- **RLS Policies:** Użytkownicy mogą dodawać/edytować tylko swoje recenzje
- **Pliki:** `src/pages/MaterialDetailPage.tsx` (formularz, lista), `src/store/reviewStore.ts` (opcjonalnie)
- **Typy:** `Review` interface w `src/data/materials.ts`

## 5. Kroki implementacji
1. Utwórz tabelę `reviews` w Supabase (z politykami RLS)
2. Dodaj typ `Review` do `src/data/materials.ts`
3. Utwórz store `useReviewStore.ts` (lub użyj direct Supabase calls)
4. W `MaterialDetailPage.tsx` dodaj:
   - Formularz oceny (5 gwiazdek + textarea)
   - Listę komentarzy (z pętlą po reviews)
   - Przycisk "Edytuj" dla własnych recenzji
5. Obsłuż submit review → insert into `reviews`
6. Odśwież dane po submit/update
7. Wyświetlaj średnią ocenę (obliczoną z `average_rating` w materials lub live query)

## 6. Schemat bazy danych — tabela `reviews`

```sql
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(material_id, user_id) -- jeden użytkownik — jedna recenzja
);

-- Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Polityki
CREATE POLICY "Public read reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Owner can update" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner can delete" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);
```

## 7. Kryteria akceptacji
- Użytkownik zalogowany widzi formularz oceny pod materiałem
- Po wysłaniu recenzji, średnia ocena materiału się aktualizuje
- Komentarz pojawia się na liście pod formularzem
- Można edytować swoją recenzję (ikona ołówka)
- Można usunąć recenzję (ikona kosza)
- Anonimowi użytkownicy widzą tylko listę ocen/komentarzy (bez formularza)

## 8. Uwagi
- Średnia ocena (`average_rating`) może być przechowywana w tabeli `materials` jako cached value (aktualizowana przez trigger) lub liczona na żądanie via `COUNT`+`AVG` query.
- Dla MVP lepiej liczyć na żądanie (prościej).
- Trigger do automatycznego update `materials.average_rating` przy insert/update/delete review:
```sql
CREATE OR REPLACE FUNCTION update_material_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.materials
  SET 
    average_rating = (SELECT AVG(rating) FROM public.reviews WHERE material_id = COALESCE(NEW.material_id, OLD.material_id)),
    total_ratings = (SELECT COUNT(*) FROM public.reviews WHERE material_id = COALESCE(NEW.material_id, OLD.material_id))
  WHERE id = COALESCE(NEW.material_id, OLD.material_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_material_rating();
```

---

## Status: ✅ DONE
Zaimplementowano w `MaterialDetailPage.tsx` i Supabase.
