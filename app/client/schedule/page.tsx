'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function ClientSchedulePage() {
  const [slots, setSlots] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!clientData) {
      setClient(null)
      setLoading(false)
      return
    }
    setClient(clientData)

    // Get coach's availability
    const { data: slotsData } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('coach_id', clientData.coach_id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    // Get client's sessions
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientData.id)
      .order('scheduled_time', { ascending: true })

    setSlots(slotsData || [])
    setSessions(sessionsData || [])
    setLoading(false)
  }

  const handleRequestSession = async (slotId: string) => {
    if (!client) return

    const slot = slots.find(s => s.id === slotId)
    if (!slot) return

    const { error } = await supabase
      .from('sessions')
      .insert({
        coach_id: client.coach_id,
        client_id: client.id,
        availability_slot_id: slotId,
        scheduled_time: slot.start_time,
        status: 'pending',
      })

    if (!error) {
      loadData()
    }
  }

  if (loading) return <div>Loading...</div>

  if (!client) {
    return (
      <div className="space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
        <p className="text-gray-600">
          There is no client record for this account. Contact your coach to be added and to receive a portal invite.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md font-medium px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Back to login
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">View availability and request sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slots.length > 0 ? (
                slots.map((slot) => {
                  const isBooked = sessions.some(s => s.availability_slot_id === slot.id)
                  return (
                    <div key={slot.id} className="border-b pb-4 last:border-0">
                      <p className="font-medium">
                        {format(new Date(slot.start_time), 'MMM d, yyyy h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {slot.is_group_session ? 'Group Session' : 'Private Session'}
                      </p>
                      {!isBooked && (
                        <Button size="sm" onClick={() => handleRequestSession(slot.id)}>
                          Request Session
                        </Button>
                      )}
                      {isBooked && (
                        <span className="text-sm text-gray-500">Already requested</span>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500">No available slots</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium">
                      {format(new Date(session.scheduled_time), 'MMM d, yyyy h:mm a')}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      session.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No sessions scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

