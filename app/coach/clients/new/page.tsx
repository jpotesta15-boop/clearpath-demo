'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [sendInvite, setSendInvite] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Not signed in')
      setSaving(false)
      return
    }
    const clientId = typeof process.env.NEXT_PUBLIC_CLIENT_ID === 'string'
      ? process.env.NEXT_PUBLIC_CLIENT_ID
      : null
    const emailTrimmed = form.email.trim() || null
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        coach_id: user.id,
        full_name: form.full_name.trim(),
        email: emailTrimmed,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
        ...(clientId && { client_id: clientId }),
      })
      .select('id')
      .single()
    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }
    if (sendInvite && emailTrimmed) {
      const res = await fetch('/api/invite-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to send invite')
        setSaving(false)
        return
      }
    }
    setSaving(false)
    if (newClient?.id) {
      router.push(`/coach/clients/${newClient.id}`)
    } else {
      router.push('/coach/clients')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/coach/clients"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Clients
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Add Client</h1>
      <Card>
        <CardHeader>
          <CardTitle>New client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name *
              </label>
              <Input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. Jordan Lee"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="555-0100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
            {form.email.trim() && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendInvite"
                  checked={sendInvite}
                  onChange={(e) => setSendInvite(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="sendInvite" className="text-sm text-gray-700">
                  Send portal invite (client can set password and log in)
                </label>
              </div>
            )}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Add client'}
              </Button>
              <Link href="/coach/clients">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
