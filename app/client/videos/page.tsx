import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ClientVideosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('email', user?.email)
    .single()

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

  const { data: videos } = await supabase
    .from('video_assignments')
    .select('*, videos(*)')
    .eq('client_id', client.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Videos</h1>
        <p className="mt-1 text-sm text-gray-500">Assigned training videos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos && videos.length > 0 ? (
          videos.map((assignment: any) => (
            <Card key={assignment.id}>
              <CardHeader>
                <CardTitle>{assignment.videos?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.videos?.category && (
                  <p className="text-sm text-primary-600 mb-2">{assignment.videos.category}</p>
                )}
                {assignment.videos?.description && (
                  <p className="text-sm text-gray-600 mb-4">{assignment.videos.description}</p>
                )}
                <a
                  href={assignment.videos?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm"
                >
                  Watch Video →
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No videos assigned yet</p>
        )}
      </div>
    </div>
  )
}

