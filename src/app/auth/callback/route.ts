import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        auth: {
          flowType: 'pkce',
        },
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Create profile row on first login if it doesn't exist yet
      if (data.user) {
        // Fetch current login_count to increment it
        const { data: profile } = await supabase
          .from('profiles')
          .select('login_count')
          .eq('id', data.user.id)
          .single()

        await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email,
              last_login_at: new Date().toISOString(),
              login_count: (profile?.login_count ?? 0) + 1,
            },
            { onConflict: 'id', ignoreDuplicates: false }
          )
      }
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // No code — Supabase may have sent an error in the URL
  const errorDesc = searchParams.get('error_description')
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(errorDesc ?? 'No code received')}`
  )
}
