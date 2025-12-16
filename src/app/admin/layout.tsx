import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MainLayout from '@/components/layout/MainLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch profile to verify user type
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, full_name, email')
    .eq('id', session.user.id)
    .single()

  if (profile?.user_type !== 'staff') {
    redirect('/dashboard')
  }

  return <MainLayout>{children}</MainLayout>
}
