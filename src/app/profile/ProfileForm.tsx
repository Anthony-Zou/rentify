'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const DOMAIN_MAP: Record<string, string> = {
  'u.nus.edu': 'NUS — National University of Singapore',
  'nus.edu.sg': 'NUS — National University of Singapore',
  'e.ntu.edu.sg': 'NTU — Nanyang Technological University',
  'ntu.edu.sg': 'NTU — Nanyang Technological University',
  'smu.edu.sg': 'SMU — Singapore Management University',
  'mymail.sutd.edu.sg': 'SUTD — Singapore University of Technology and Design',
  'sutd.edu.sg': 'SUTD — Singapore University of Technology and Design',
  'singaporetech.edu.sg': 'SIT — Singapore Institute of Technology',
  'suss.edu.sg': 'SUSS — Singapore University of Social Sciences',
}

function detectUniversity(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return DOMAIN_MAP[domain] ?? ''
}

type Props = {
  userId: string
  userEmail: string
  initialFullName: string
  initialTelegram: string
  initialUniversity: string
}

export default function ProfileForm({ userId, userEmail, initialFullName, initialTelegram, initialUniversity }: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [telegram, setTelegram] = useState(initialTelegram)
  const detectedUniversity = detectUniversity(userEmail)
  const [university, setUniversity] = useState(initialUniversity || detectedUniversity)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setLoading(true)

    const supabase = createClient()
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        telegram_handle: telegram.replace(/^@/, ''),
        university_name: university,
      })

    setLoading(false)

    if (upsertError) {
      setError(upsertError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telegram handle <span className="text-red-500">*</span>
          <span className="ml-1 font-normal text-gray-400">(renters use this to contact you)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">@</span>
          <input
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value.replace(/^@/, ''))}
            placeholder="yourusername"
            required
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
        {detectedUniversity ? (
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
            {university || detectedUniversity}
          </div>
        ) : (
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Your university"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving…' : 'Save profile'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  )
}
