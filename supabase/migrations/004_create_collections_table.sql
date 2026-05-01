-- System Kolekcji Materiałów
-- Tabela przechowuje kolekcje tworzone przez użytkowników

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  material_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela łącząca materiały z kolekcjami (many-to-many)
CREATE TABLE IF NOT EXISTS public.collection_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now(),
  added_by uuid NOT NULL REFERENCES auth.users(id),
  UNIQUE(collection_id, material_id)
);

-- Włącz Row Level Security dla collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Polityki dla collections
-- 1. Właściciel może wszystko ze swoimi kolekcjami
CREATE POLICY "Owners can do everything with collections" ON public.collections
  FOR ALL USING (auth.uid() = user_id);

-- 2. Publiczny dostęp do odczytu publicznych kolekcji
CREATE POLICY "Public read access to collections" ON public.collections
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Włącz Row Level Security dla collection_materials
ALTER TABLE public.collection_materials ENABLE ROW LEVEL SECURITY;

-- Polityki dla collection_materials
-- 1. Właściciel kolekcji może zarządzać materiałami w niej
CREATE POLICY "Collection owners can manage materials" ON public.collection_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE collections.id = collection_materials.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

-- 2. Publiczny dostęp do odczytu materiałów w publicznych kolekcjach
CREATE POLICY "Public read access to collection materials" ON public.collection_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE collections.id = collection_materials.collection_id 
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON public.collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collection_materials_collection_id ON public.collection_materials(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_materials_material_id ON public.collection_materials(material_id);

-- Trigger do automatycznej aktualizacji licznika materiałów w kolekcji
CREATE OR REPLACE FUNCTION update_collection_material_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections 
    SET material_count = material_count + 1 
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections 
    SET material_count = material_count - 1 
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collection_material_count_trigger
AFTER INSERT OR DELETE ON public.collection_materials
FOR EACH ROW EXECUTE FUNCTION update_collection_material_count();

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_updated_at 
BEFORE UPDATE ON public.collections 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
