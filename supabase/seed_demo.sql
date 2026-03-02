-- Demo seed data for ClearPath coach demo
--
-- BEFORE RUNNING:
-- 1. Create your coach user in Supabase: Authentication → Users → Add user (e.g. coach@demo.com)
-- 2. Insert the coach profile (if not auto-created) with that user's id and tenant_id = 'demo'
-- 3. Copy the coach user's UUID and replace EVERY occurrence of YOUR_COACH_UUID_HERE below with it
-- 4. Run this entire file in the Supabase SQL Editor

-- ========== FAKE CLIENTS (5) ==========
INSERT INTO public.clients (id, coach_id, full_name, email, phone, notes)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'YOUR_COACH_UUID_HERE', 'Jordan Lee', 'jordan.lee@example.com', '555-0101', 'Prefers morning sessions. Working on combos.'),
  ('a1000000-0000-4000-8000-000000000002', 'YOUR_COACH_UUID_HERE', 'Sam Rivera', 'sam.rivera@example.com', '555-0102', 'Competition prep. Heavy bag focus.'),
  ('a1000000-0000-4000-8000-000000000003', 'YOUR_COACH_UUID_HERE', 'Alex Chen', 'alex.chen@example.com', '555-0103', 'New to kickboxing. Building fundamentals.'),
  ('a1000000-0000-4000-8000-000000000004', 'YOUR_COACH_UUID_HERE', 'Morgan Taylor', 'morgan.taylor@example.com', '555-0104', 'Intermediate. Interested in sparring.'),
  ('a1000000-0000-4000-8000-000000000005', 'YOUR_COACH_UUID_HERE', 'Casey Davis', 'casey.davis@example.com', '555-0105', 'Evening availability only.')
ON CONFLICT (id) DO NOTHING;

-- ========== 3 UNREAD MESSAGES (to coach; sender = coach for demo) ==========
INSERT INTO public.messages (sender_id, recipient_id, content, read_at)
VALUES
  ('YOUR_COACH_UUID_HERE', 'YOUR_COACH_UUID_HERE', 'Hey, can we move our session to 3pm instead?', NULL),
  ('YOUR_COACH_UUID_HERE', 'YOUR_COACH_UUID_HERE', 'Thanks for the workout plan! When is the next slot?', NULL),
  ('YOUR_COACH_UUID_HERE', 'YOUR_COACH_UUID_HERE', 'Running 10 min late today, see you soon.', NULL);

-- ========== AVAILABILITY SLOTS (next 7 days, 9am-10am each day) ==========
INSERT INTO public.availability_slots (coach_id, start_time, end_time, is_group_session, max_participants)
SELECT
  'YOUR_COACH_UUID_HERE'::uuid,
  (date_trunc('day', NOW()) + (n || ' days')::interval + '09:00'::interval)::timestamptz,
  (date_trunc('day', NOW()) + (n || ' days')::interval + '10:00'::interval)::timestamptz,
  false,
  1
FROM generate_series(0, 6) AS n;

-- ========== SESSIONS (2 confirmed, 1 pending) ==========
INSERT INTO public.sessions (coach_id, client_id, availability_slot_id, scheduled_time, status, notes)
SELECT
  'YOUR_COACH_UUID_HERE'::uuid,
  'a1000000-0000-4000-8000-000000000001'::uuid,
  (SELECT id FROM public.availability_slots WHERE coach_id = 'YOUR_COACH_UUID_HERE'::uuid ORDER BY start_time ASC LIMIT 1),
  (date_trunc('day', NOW()) + '1 day'::interval + '09:00'::interval)::timestamptz,
  'confirmed',
  'Private lesson - combos';

INSERT INTO public.sessions (coach_id, client_id, availability_slot_id, scheduled_time, status, notes)
SELECT
  'YOUR_COACH_UUID_HERE'::uuid,
  'a1000000-0000-4000-8000-000000000002'::uuid,
  (SELECT id FROM public.availability_slots WHERE coach_id = 'YOUR_COACH_UUID_HERE'::uuid ORDER BY start_time ASC OFFSET 1 LIMIT 1),
  (date_trunc('day', NOW()) + '2 days'::interval + '09:00'::interval)::timestamptz,
  'confirmed',
  NULL;

INSERT INTO public.sessions (coach_id, client_id, availability_slot_id, scheduled_time, status, notes)
VALUES
  ('YOUR_COACH_UUID_HERE'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, NULL,
   (date_trunc('day', NOW()) + '3 days'::interval + '14:00'::interval)::timestamptz,
   'pending', 'Requested by client');
