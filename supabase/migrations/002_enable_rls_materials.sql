-- Enable RLS on materials table
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access (everyone can view materials)
CREATE POLICY "Public read materials" ON public.materials
  FOR SELECT USING (true);

-- Policy 2: Authenticated users can insert their own materials
CREATE POLICY "Authenticated insert materials" ON public.materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- Policy 3: Owners can update their own materials
CREATE POLICY "Owner can update materials" ON public.materials
  FOR UPDATE USING (auth.uid() = author_id);

-- Policy 4: Owners can delete their own materials
CREATE POLICY "Owner can delete materials" ON public.materials
  FOR DELETE USING (auth.uid() = author_id);
