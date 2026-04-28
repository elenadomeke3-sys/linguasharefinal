-- Update existing materials to set author_id from auth.users
-- Run this ONCE to backfill author_id for materials created before author_id column was added
UPDATE public.materials m
SET author_id = u.id
FROM auth.users u
WHERE m.author_name = u.raw_user_meta_data->>'full_name'
  AND m.author_id IS NULL;

-- If above doesn't match (case differences), try case-insensitive:
-- UPDATE public.materials m
-- SET author_id = u.id
-- FROM auth.users u
-- WHERE LOWER(m.author_name) = LOWER(u.raw_user_meta_data->>'full_name')
--   AND m.author_id IS NULL;

-- If still no matches, you may need to manually assign or use a fallback:
-- UPDATE public.materials
-- SET author_id = 'TODO-INSERT-USER-ID-HERE'
-- WHERE author_id IS NULL;
