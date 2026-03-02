'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function ClientNotesEditor({
  clientId,
  initialNotes,
}: {
  clientId: string
  initialNotes: string | null
}) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('clients')
      .update({ notes: notes || null })
      .eq('id', clientId)
    setSaving(false)
    if (!error) setSaved(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this client..."
          className="w-full min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={4}
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save notes'}
          </Button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </CardContent>
    </Card>
  )
}
