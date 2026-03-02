import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/SidebarNav'

const clientNavItems = [
  { href: '/client/dashboard', label: 'Dashboard' },
  { href: '/client/programs', label: 'Programs' },
  { href: '/client/schedule', label: 'Schedule' },
  { href: '/client/videos', label: 'Videos' },
  { href: '/client/messages', label: 'Messages' },
]

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav navItems={clientNavItems} />
      <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

