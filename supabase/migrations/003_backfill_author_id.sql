-- Update existing materials to set author_id from auth.users
-- Run this ONCE to backfill author_id for materials created before author_id column was added
UPDATE public.materials m
SET author_id = u.id
FROM auth.users u
WHERE m.author_name = u.user_metadata->>'full_name'
  AND m.author_id IS NULL;

-- Alternatively, if you want to set a default author for materials without matching name:
-- UPDATE public.materials
-- SET author_id = 'some-user-id-here'
-- WHERE author_id IS NULL;
