import Link from 'next/link'

export default function Landing({
  isLoggedIn = false,
  listingCount = 0,
  studentCount = 0,
}: {
  isLoggedIn?: boolean
  listingCount?: number
  studentCount?: number
}) {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-violet-50 border-b border-violet-100 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-violet-300/20 blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12">

            {/* Left — copy */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-6">
                Rent anything<br />
                <span className="text-violet-600">from fellow students.</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
                Camera for your grad shoot. Suit for your internship interview.
                Gaming console for the weekend. Whatever you need — for just a few days.
              </p>
              <div className="flex flex-wrap gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/new"
                    className="px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
                  >
                    Post your item →
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
                  >
                    Sign up free →
                  </Link>
                )}
                <a
                  href="#listings"
                  className="px-6 py-3 border border-gray-300 bg-white text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Browse listings
                </a>
              </div>
              {!isLoggedIn && (
                <p className="mt-4 text-xs text-gray-400">
                  University email required (.edu.sg or .edu)
                </p>
              )}

              {/* Live stats */}
              {(listingCount > 0 || studentCount > 0) && (
                <div className="flex flex-wrap gap-6 mt-8">
                  {listingCount > 0 && (
                    <div>
                      <p className="text-2xl font-black text-gray-900">{listingCount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">items listed</p>
                    </div>
                  )}
                  {studentCount > 0 && (
                    <div>
                      <p className="text-2xl font-black text-gray-900">{studentCount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">students joined</p>
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-black text-gray-900">5+</p>
                    <p className="text-xs text-gray-400 mt-0.5">universities</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right — mock listing cards */}
            <div className="hidden md:flex flex-col gap-3 w-72 shrink-0 select-none">
              {[
                { title: 'Sony A7III Mirrorless Camera', price: 28, tag: 'Electronics', school: 'NUS', available: true },
                { title: 'Badminton Racket Set (2 rackets)', price: 8, tag: 'Sports', school: 'NTU', available: true },
                { title: 'Casio FX-9860GIII Calculator', price: 5, tag: 'Study', school: 'SMU', available: true },
                { title: 'Formal Suit (M, navy)', price: 18, tag: 'Lifestyle', school: 'NUS', available: false },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3"
                >
                  {/* Colour swatch as image placeholder */}
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-black ${
                    card.tag === 'Electronics' ? 'bg-violet-500' :
                    card.tag === 'Sports' ? 'bg-green-500' :
                    card.tag === 'Study' ? 'bg-blue-500' :
                    'bg-amber-500'
                  }`}>
                    {card.tag === 'Electronics' ? '📷' :
                     card.tag === 'Sports' ? '🏸' :
                     card.tag === 'Study' ? '🧮' : '👔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{card.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{card.school} · {card.tag}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-violet-600">${card.price}</p>
                    <p className="text-[10px] text-gray-400">/day</p>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-gray-400 mt-1">+ {listingCount > 4 ? listingCount - 4 : 'more'} more listings →</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-2 mb-10">
            <span className="text-xs font-semibold tracking-widest text-violet-500 uppercase">
              How it works
            </span>
            <span className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center text-sm font-black mb-4 group-hover:bg-violet-700 transition-colors">
                1
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">List your idle item</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Upload a photo, set a daily price, and publish in under 2 minutes. Any category welcome.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                🎓 University email verified
              </span>
            </div>
            {/* Step 2 */}
            <div className="group">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center text-sm font-black mb-4 group-hover:bg-violet-700 transition-colors">
                2
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Request the dates you need</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Pick start and end dates, add a short message. The owner gets an email and accepts or declines.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                ✓ No double bookings
              </span>
            </div>
            {/* Step 3 */}
            <div className="group">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center text-sm font-black mb-4 group-hover:bg-violet-700 transition-colors">
                3
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Meet on campus, safely</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Once accepted, you'll get the owner's Telegram. Meet at a campus CCTV location — library, Student Services Centre, or faculty lobby. Both parties show their student ID at handover.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  📹 CCTV location
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  🪪 Student ID
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Earn section ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold tracking-widest text-violet-500 uppercase">
              For owners
            </span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                Your idle gear is<br />
                <span className="text-violet-600">earning $0 right now.</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3 max-w-lg leading-relaxed">
                Thousands of students on campus need things for just a few days — and they'd rather rent from a fellow student than buy. List once, earn every rental.
              </p>
            </div>
            <Link
              href={isLoggedIn ? '/new' : '/login?next=/new'}
              className="shrink-0 px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 text-center"
            >
              List your first item →
            </Link>
          </div>

          {/* Earnings examples by category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                category: 'Sports & Outdoor',
                color: 'green',
                items: [
                  { name: 'Badminton Racket Set', price: '$8', monthly: '$48' },
                  { name: 'Camping Tent', price: '$15', monthly: '$75' },
                  { name: 'Foldable Bicycle', price: '$20', monthly: '$100' },
                ],
              },
              {
                category: 'Study & Academic',
                color: 'blue',
                items: [
                  { name: 'Graphics Calculator', price: '$5', monthly: '$30' },
                  { name: 'Drawing Tablet', price: '$15', monthly: '$60' },
                  { name: 'Portable Projector', price: '$20', monthly: '$80' },
                ],
              },
              {
                category: 'Tech & Office',
                color: 'violet',
                items: [
                  { name: 'Mechanical Keyboard', price: '$10', monthly: '$50' },
                  { name: 'iPad / Tablet', price: '$18', monthly: '$90' },
                  { name: 'DSLR Camera', price: '$25', monthly: '$150' },
                ],
              },
              {
                category: 'Hobbies & Lifestyle',
                color: 'amber',
                items: [
                  { name: 'Guitar / Ukulele', price: '$10', monthly: '$50' },
                  { name: 'Formal Suit / Dress', price: '$18', monthly: '$72' },
                  { name: 'Drone', price: '$35', monthly: '$175' },
                ],
              },
            ].map(({ category, color, items }) => (
              <div key={category} className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className={`text-xs font-bold tracking-wide uppercase mb-3 ${
                  color === 'green' ? 'text-green-600' :
                  color === 'blue' ? 'text-blue-600' :
                  color === 'violet' ? 'text-violet-600' :
                  'text-amber-600'
                }`}>{category}</p>
                <div className="space-y-2.5">
                  {items.map(({ name, price, monthly }) => (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 leading-tight">{name}</span>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-400">{price}/day</span>
                        <span className="text-xs font-bold text-violet-600 ml-1.5">→ {monthly}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Owner trust signals */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">How your item stays safe</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">University email verified</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Every renter is a verified student at NUS, NTU, SMU or other Singapore universities — not a random stranger.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14m0-4v4m0-4l-6-3m6 7l-6 3m0 0V7m0 7L3 11" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">CCTV handover on campus</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">All handovers happen at campus CCTV locations — library, SSC, or faculty lobby. Both parties show student ID.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">You stay in control</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">You approve every booking before it's confirmed. Set your own price, block out dates, and cancel anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              University email verified
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14m0-4v4m0-4l-6-3m6 7l-6 3m0 0V7m0 7L3 11" />
                </svg>
              </span>
              Handover at on-campus CCTV locations
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Availability calendar — no double bookings
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              Email notifications for every update
            </div>
          </div>
        </div>
      </section>

      {/* ── Borlo Pool ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                Coming soon
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                Borlo Pool —<br />co-own, list, earn together.
              </h2>
              <p className="text-violet-200 text-sm leading-relaxed max-w-lg mb-6">
                Got your eye on a drone or a cinema camera but can't justify the price alone?
                Pool with 2–5 friends, split the cost, list it on Borlo, and share the rental income.
                Your gear pays for itself.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/pool"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-violet-700 text-sm font-bold rounded-xl hover:bg-violet-50 transition-colors"
                >
                  Learn more →
                </a>
                <span className="inline-flex items-center gap-2 text-sm text-violet-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Launching after core platform is stable
                </span>
              </div>
            </div>

            {/* How it works mini-steps */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-3">
              {[
                { n: '1', label: 'Form a pool', sub: '2–5 students, any item' },
                { n: '2', label: 'Split the cost', sub: 'Each contributes a share' },
                { n: '3', label: 'List on Borlo', sub: 'Pool account earns rental income' },
                { n: '4', label: 'Earn together', sub: 'Revenue split by ownership share' },
              ].map(({ n, label, sub }) => (
                <div key={n} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/15 text-white text-xs font-black flex items-center justify-center">
                    {n}
                  </span>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none mb-0.5">{label}</p>
                    <p className="text-violet-300 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-700 to-violet-900">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-violet-300 text-xs font-semibold tracking-widest uppercase mb-3">For owners</p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Got something sitting idle?
          </h2>
          <p className="text-violet-200 mb-8 text-sm">
            List it in 2 minutes. Earn from gear you're not using.
          </p>
          <Link
            href={isLoggedIn ? '/new' : '/login?next=/new'}
            className="inline-block px-8 py-3 bg-white text-violet-700 text-sm font-bold rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
          >
            Post your first item →
          </Link>
        </div>
      </section>
    </div>
  )
}
