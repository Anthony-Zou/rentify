import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import Header from '@/components/Header'

export default async function PoolPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showPostButton />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-10 inline-block">
          ← Back to Borlo
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
            Coming soon
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Borlo Pool
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
            Co-own high-value gear with friends. List it on Borlo. Split the rental income.
            <span className="text-violet-600 font-semibold"> Your stuff pays for itself.</span>
          </p>
        </div>

        {/* Problem → Solution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">The problem</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>A Sony A7 IV costs ~$3,500. A DJI Mavic 3 costs ~$2,200. A good microphone kit runs $800.</p>
            <p>Most students can't justify that alone — but 4 students splitting the cost? That's suddenly very reasonable. The problem is there's no structure: no clear ownership, no agreement on who gets to use it when, no way to earn back the cost.</p>
            <p className="font-medium text-gray-800">Borlo Pool solves all three.</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">How Borlo Pool works</h2>
          <div className="space-y-6">
            {[
              {
                n: '1',
                title: 'Form a pool',
                body: 'Start a pool for any item — drone, camera, guitar, camping tent. Invite 2–5 fellow students. Each member contributes a share of the purchase price.',
              },
              {
                n: '2',
                title: 'Buy together',
                body: 'Once the pool is fully funded, Borlo facilitates the purchase. The item is registered as a pool asset — shared ownership recorded on-platform.',
              },
              {
                n: '3',
                title: 'List it on Borlo',
                body: 'The item is automatically listed on Borlo as a pool-owned rental. Any student can rent it just like any other listing. Pool members can also book private use days.',
              },
              {
                n: '4',
                title: 'Earn together',
                body: 'Every rental generates income. Revenue is distributed to pool members proportionally to their ownership share — automatically, no awkward money transfers between friends.',
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-xl flex items-center justify-center text-sm font-black">
                  {n}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Example — 4 students, 1 drone</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {[
              { label: 'Item', value: 'DJI Mavic 3' },
              { label: 'Purchase price', value: 'S$2,200' },
              { label: 'Pool members', value: '4 students' },
              { label: 'Each contributes', value: 'S$550' },
              { label: 'Daily rental rate', value: 'S$35 /day' },
              { label: 'Break-even', value: '~63 rental days' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            After break-even, each rental day puts <span className="font-semibold text-violet-700">~S$8.75 back into each member's account</span>. Popular items can pay back the full investment within a semester.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-3">Interested?</p>
          <h2 className="text-xl font-black text-white mb-2">Be the first to know when Borlo Pool launches.</h2>
          <p className="text-gray-400 text-sm mb-6">We're building the core platform first. Pool is next.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors"
          >
            Back to Borlo — start renting now
          </Link>
        </div>
      </main>
    </div>
  )
}
