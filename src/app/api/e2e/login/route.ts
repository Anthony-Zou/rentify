import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

// This route only works when ENABLE_E2E_TESTING=true.
// It generates an OTP via the admin API (no email sent) and verifies it,
// setting auth cookies so Playwright can authenticate without going through email.
export async function GET(request: NextRequest) {
  if (process.env.ENABLE_E2E_TESTING !== 'true') {
    return new Response('Not found', { status: 404 })
  }

  const { searchParams, origin } = new URL(request.url)
  const email = searchParams.get('email')
  const next = searchParams.get('next') ?? '/'

  if (!email) {
    return new Response('Missing email', { status: 400 })
  }

  try {
    const password = process.env.E2E_TEST_PASSWORD
    if (!password) {
      return new Response('E2E_TEST_PASSWORD not set', { status: 500 })
    }

    // Sign in with password using the SSR client so it writes session cookies to the response
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      console.error('[e2e/login] signInWithPassword failed:', signInError.message)
      return new Response(`signIn failed: ${signInError.message}`, { status: 500 })
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (err) {
    console.error('[e2e/login] unexpected error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
