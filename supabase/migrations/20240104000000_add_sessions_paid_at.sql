-- Add simple payment tracking: when a session was marked as paid
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN public.sessions.paid_at IS 'When the coach marked this session as paid (optional tracking)';
