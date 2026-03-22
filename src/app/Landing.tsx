import Link from 'next/link'

export default function Landing() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">
              Singapore Universities
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
              Rent anything<br />from fellow students.
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
              Camera for your grad shoot. Suit for your internship interview.
              Gaming console for the weekend. Whatever you need — for just a few days.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign up free →
              </Link>
              <a
                href="#listings"
                className="px-6 py-3 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse listings
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              University email required (.edu.sg or .edu)
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div>
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">List your idle item</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload a photo, set a daily price, and publish in under 2 minutes. Any category welcome.
              </p>
            </div>
            {/* Step 2 */}
            <div>
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Request the dates you need</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pick start and end dates, add a short message. The owner gets an email and accepts or declines.
              </p>
            </div>
            {/* Step 3 */}
            <div>
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Meet on campus</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Once accepted, you'll get the owner's Telegram. Arrange handover at a monitored campus location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-wrap gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              University email verified
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14m0-4v4m0-4l-6-3m6 7l-6 3m0 0V7m0 7L3 11" />
              </svg>
              Handover at on-campus CCTV locations
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Availability calendar — no double bookings
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email notifications for every update
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="bg-black">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Got something sitting idle?
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            List it in 2 minutes. Earn from gear you're not using.
          </p>
          <Link
            href="/login?next=/new"
            className="inline-block px-8 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Post your first item →
          </Link>
        </div>
      </section>
    </div>
  )
}
