-- Sessions table has client_id as UUID (fighter). Add tenant_id for RLS tenant check.
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS tenant_id TEXT;
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON public.sessions(tenant_id);

-- Drop policies that used client_id as tenant (client_id is fighter UUID)
DROP POLICY IF EXISTS "Coaches can manage sessions in their tenant" ON public.sessions;
DROP POLICY IF EXISTS "Clients can view sessions in their tenant" ON public.sessions;
DROP POLICY IF EXISTS "Clients can create session requests in their tenant" ON public.sessions;

-- Coaches: tenant_id must match and coach must be in that tenant
CREATE POLICY "Coaches can manage sessions in their tenant" ON public.sessions
  FOR ALL USING (
    tenant_id = get_current_client_id() AND
    coach_id IN (
      SELECT id FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'coach'
      AND tenant_id = get_current_client_id()
    )
  );

-- Clients: view sessions in their tenant for their own client record
CREATE POLICY "Clients can view sessions in their tenant" ON public.sessions
  FOR SELECT USING (
    tenant_id = get_current_client_id() AND
    client_id IN (
      SELECT id FROM public.clients
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
      AND client_id = get_current_client_id()
    )
  );

-- Clients: create session requests in their tenant
CREATE POLICY "Clients can create session requests in their tenant" ON public.sessions
  FOR INSERT WITH CHECK (
    tenant_id = get_current_client_id() AND
    client_id IN (
      SELECT id FROM public.clients
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
      AND client_id = get_current_client_id()
    )
  );
