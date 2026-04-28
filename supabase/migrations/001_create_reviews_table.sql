-- System Oceny i Komentarzy
-- Tabela przechowuje recenzje/oceny materiałów

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  user_name text, -- cached user display name
  user_avatar text, -- cached avatar url
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(material_id, user_id) -- jeden użytkownik — jedna recenzja
);

-- Włącz Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Polityki
-- 1. Publiczny dostęp do odczytu recenzji
CREATE POLICY "Public read reviews" ON public.reviews
  FOR SELECT USING (true);

-- 2. Zalogowani użytkownicy mogą dodawać recenzje (tylko swoje)
CREATE POLICY "Authenticated insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 3. Użytkownicy mogą edytować swoje recenzje
CREATE POLICY "Owner can update" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Użytkownicy mogą usuwać swoje recenzje
CREATE POLICY "Owner can delete" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger do automatycznego aktualizowania average_rating i total_ratings w materials
CREATE OR REPLACE FUNCTION update_material_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.materials
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE material_id = COALESCE(NEW.material_id, OLD.material_id)),
    total_ratings = (SELECT COUNT(*) FROM public.reviews WHERE material_id = COALESCE(NEW.material_id, OLD.material_id))
  WHERE id = COALESCE(NEW.material_id, OLD.material_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_material_rating();
