import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generate OTP without sending email — returns email_otp in properties
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'email',
      email,
    })

    if (linkError || !linkData?.properties?.email_otp) {
      console.error('[e2e/login] generateLink failed:', linkError?.message)
      return new Response(`generateLink failed: ${linkError?.message}`, { status: 500 })
    }

    const otp = linkData.properties.email_otp

    // Verify OTP using the SSR client so it writes session cookies to the response
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

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (verifyError) {
      console.error('[e2e/login] verifyOtp failed:', verifyError.message)
      return new Response(`verifyOtp failed: ${verifyError.message}`, { status: 500 })
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (err) {
    console.error('[e2e/login] unexpected error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
