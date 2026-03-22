import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  // Use anon client to get the authenticated user
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('[track-login] no user:', userError)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use admin client to bypass RLS
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('login_count')
    .eq('id', user.id)
    .single()

  const newCount = (profile?.login_count ?? 0) + 1

  const { error } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        last_login_at: new Date().toISOString(),
        login_count: newCount,
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )

  if (error) {
    console.error('[track-login] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[track-login] updated', user.email, 'login_count ->', newCount)
  return NextResponse.json({ ok: true, login_count: newCount })
}

// GET: verify current profile state (for debugging)
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, email, login_count, last_login_at')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ user_id: user.id, profile, error })
}
