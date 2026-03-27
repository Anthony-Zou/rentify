'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.endsWith('.edu.sg') && !email.endsWith('.edu')) {
      setError('Only university email addresses are allowed (e.g. .edu.sg or .edu).')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)

    if (otpError) {
      setError(otpError.message)
    } else {
      setStep('code')
    }
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    // verifyOtp can return an error even when auth succeeds (e.g. token already consumed
    // but session was established). Always check actual auth state before showing error.
    const { data: { user } } = await supabase.auth.getUser()
    setLoading(false)

    if (user) {
      // Track login server-side (update email, login_count, last_login_at)
      await fetch('/api/track-login', { method: 'POST' })
      const next = new URLSearchParams(window.location.search).get('next') ?? '/'
      router.push(next)
      router.refresh()
    } else {
      setError(verifyError?.message ?? 'Invalid code. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-violet-100 p-8 max-w-sm w-full">
        <Link href="/" className="text-lg font-black mb-6 inline-block">
          <span className="text-gray-900">Bor</span><span className="text-violet-600">lo</span>
        </Link>

        {step === 'email' ? (
          <>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Sign in</h1>
            <p className="text-sm text-gray-500 mb-6">
              University students only — use your university email (.edu.sg or .edu).
            </p>

            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  University email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. e1234567@u.nus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending…' : 'Send code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Check your inbox</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a code to{' '}
              <span className="font-medium text-gray-700">{email}</span>.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Login code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying…' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(null) }}
                className="w-full text-sm text-gray-500 hover:text-gray-800"
              >
                Use a different email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
