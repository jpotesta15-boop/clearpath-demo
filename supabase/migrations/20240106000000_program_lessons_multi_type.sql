-- Program lessons: support video, link, note, image (lesson blocks)
ALTER TABLE public.program_lessons
  ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;

ALTER TABLE public.program_lessons
  DROP CONSTRAINT IF EXISTS program_lessons_lesson_type_check;

ALTER TABLE public.program_lessons
  ADD CONSTRAINT program_lessons_lesson_type_check
  CHECK (lesson_type IN ('video', 'link', 'note', 'image'));

-- Allow video_id to be null for non-video lessons
ALTER TABLE public.program_lessons
  ALTER COLUMN video_id DROP NOT NULL;

-- Backfill: existing rows are videos
UPDATE public.program_lessons SET lesson_type = 'video' WHERE lesson_type IS NULL;
