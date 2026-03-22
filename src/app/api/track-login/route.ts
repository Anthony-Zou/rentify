import { createServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('login_count')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        last_login_at: new Date().toISOString(),
        login_count: (profile?.login_count ?? 0) + 1,
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )

  if (error) {
    console.error('[track-login] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
