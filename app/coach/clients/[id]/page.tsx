import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { ClientNotesEditor } from './ClientNotesEditor'
import { SessionHistoryWithPay } from './SessionHistoryWithPay'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('coach_id', user!.id)
    .single()

  if (!client) {
    notFound()
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', id)
    .order('scheduled_time', { ascending: false })
    .limit(10)

  const { data: programs } = await supabase
    .from('program_assignments')
    .select('*, programs(*)')
    .eq('client_id', id)

  const { count: completedCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id)
    .eq('status', 'completed')

  const { count: upcomingCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id)
    .eq('status', 'confirmed')
    .gte('scheduled_time', new Date().toISOString())

  const { data: lastSession } = await supabase
    .from('sessions')
    .select('scheduled_time')
    .eq('client_id', id)
    .in('status', ['completed', 'confirmed'])
    .order('scheduled_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastActive = lastSession?.scheduled_time
    ? format(new Date(lastSession.scheduled_time), 'MMM d, yyyy')
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/coach/clients"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Clients
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{client.full_name}</h1>
        <Link
          href={`/coach/messages?client=${client.id}`}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Message
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Sessions completed</p>
              <p className="text-lg font-semibold">{completedCount ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-lg font-semibold">{upcomingCount ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sessions left</p>
              <p className="text-lg font-semibold">—</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last active</p>
              <p className="text-lg font-semibold">{lastActive ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes prominent: full-width so coach can add/edit easily */}
      <ClientNotesEditor clientId={client.id} initialNotes={client.notes} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Email:</span> {client.email || 'N/A'}</p>
            <p><span className="font-medium">Phone:</span> {client.phone || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {programs && programs.length > 0 ? (
            <div className="space-y-2">
              {programs.map((assignment: any) => (
                <div key={assignment.id} className="border-b pb-2 last:border-0">
                  <p className="font-medium">{assignment.programs?.name}</p>
                  {assignment.programs?.description && (
                    <p className="text-sm text-gray-500">{assignment.programs.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No programs assigned</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionHistoryWithPay
            sessions={sessions?.map((s) => ({
              id: s.id,
              scheduled_time: s.scheduled_time,
              status: s.status,
              notes: s.notes ?? null,
              paid_at: (s as { paid_at?: string | null }).paid_at ?? null,
            })) ?? []}
          />
        </CardContent>
      </Card>
    </div>
  )
}

