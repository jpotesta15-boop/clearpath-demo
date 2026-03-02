-- Allow coaches to insert and delete video_assignments for their videos and their clients.

CREATE POLICY "Coaches can manage video assignments in their tenant" ON public.video_assignments
  FOR ALL USING (
    video_id IN (
      SELECT id FROM public.videos
      WHERE coach_id IN (
        SELECT id FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'coach'
        AND tenant_id = get_current_client_id()
      )
      AND client_id = get_current_client_id()
    )
    AND client_id IN (
      SELECT id FROM public.clients
      WHERE coach_id IN (
        SELECT id FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'coach'
        AND tenant_id = get_current_client_id()
      )
      AND client_id = get_current_client_id()
    )
  );
