import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getClientId } from '@/lib/config'

export async function createClient() {
  const cookieStore = await cookies()
  const clientId = getClientId()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // Set client_id in session for RLS policies
  // This is done via a database function call after authentication
  // The RLS policies will use get_current_client_id() which checks this session variable
  if (clientId && clientId !== 'default') {
    try {
      // Set the client_id as a session variable that RLS can access
      // We'll use Supabase's rpc to set this, or set it via a custom claim
      // For now, we'll rely on the get_current_client_id() function which
      // falls back to the profile's tenant_id
      const { data: { user } } = await client.auth.getUser()
      if (user) {
        // Update the user's profile tenant_id if it doesn't match
        const { data: profile } = await client
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (profile && profile.tenant_id !== clientId) {
          await client
            .from('profiles')
            .update({ tenant_id: clientId })
            .eq('id', user.id)
        }
      }
    } catch (error) {
      // Silently fail - this is not critical for initial setup
      console.error('Failed to set client_id in session:', error)
    }
  }

  return client
}

