import Link from 'next/link'
import Header from '@/components/Header'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'About — Borlo',
  description: 'Meet the team behind Borlo, the university-first P2P rental marketplace for students in Singapore.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Borlo',
  url: 'https://www.borlo.app/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'Borlo',
    url: 'https://www.borlo.app',
    foundingDate: '2025',
    foundingLocation: 'Singapore',
    member: [
      {
        '@type': 'Person',
        name: 'Justin',
        jobTitle: 'Co-Founder & CEO',
        alumniOf: 'National University of Singapore',
      },
      {
        '@type': 'Person',
        name: 'Kenneth',
        jobTitle: 'Co-Founder & CFO',
        alumniOf: 'National University of Singapore',
      },
      {
        '@type': 'Person',
        name: 'Anthony',
        jobTitle: 'Co-Founder & CTO',
        alumniOf: [
          'Nanyang Technological University',
          'National University of Singapore',
        ],
      },
    ],
  },
}

const team = [
  {
    initial: 'J',
    name: 'Justin',
    role: 'Co-Founder & CEO',
    school: 'NUS — MSc Digital Financial Technology',
    bio: 'Ex-PwC China Associate (Big 4 · 3 yrs) · KPMG China Intern · Finance & audit background across Asia.',
    highlight: 'Leads strategy, investor relations, and go-to-market.',
    star: 'Ex-Big 4 PwC China · Audit & Finance across HK & SG',
  },
  {
    initial: 'K',
    name: 'Kenneth',
    role: 'Co-Founder & CFO',
    school: 'NUS — MSc Digital Financial Technology',
    bio: 'Ex-Julius Baer Associate Director (9 yrs · Wealth Management) · Co-founded Singapore\'s first VR arcade (Ignite VR).',
    highlight: 'Manages capital strategy, financial modelling, and fundraising.',
    star: '9 yrs Julius Baer · Serial co-founder · Wealth Management',
  },
  {
    initial: 'A',
    name: 'Anthony',
    role: 'Co-Founder & CTO',
    school: 'NTU — BEng Computer Science · NUS — MSc Digital Financial Technology',
    bio: 'AI Engineer specialising in LLM systems, RAG pipelines, and full-stack delivery. Currently at Visa Singapore. Previously A*STAR ML research and Huawei Cloud.',
    highlight: 'Builds and owns all of Borlo\'s engineering, product architecture, and AI systems.',
    star: '1st Place Hack For Cities 2023 · 1st Runner-Up HPCIC23 AI Challenge',
  },
]

export default async function AboutPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header user={user} />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 inline-block mb-8">
          ← Back
        </Link>

        {/* Mission */}
        <div className="mb-14">
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Rent anything from<br />
            <span className="text-violet-600">fellow students.</span>
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-xl">
            Borlo is a university-first, trusted peer-to-peer rental marketplace — letting students rent, lend, and earn within campus. We started at NUS and are expanding across Singapore's university network.
          </p>
          <div className="flex flex-wrap gap-6 mt-8">
            <div>
              <p className="text-xs font-semibold tracking-widest text-violet-500 uppercase mb-1">Founded</p>
              <p className="text-sm font-medium text-gray-900">2025 · Singapore</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-violet-500 uppercase mb-1">Stage</p>
              <p className="text-sm font-medium text-gray-900">Early — NUS Validation</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-violet-500 uppercase mb-1">Contact</p>
              <a href="mailto:hello@borlo.app" className="text-sm font-medium text-violet-600 hover:underline">hello@borlo.app</a>
            </div>
          </div>
        </div>

        {/* Team */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs font-semibold tracking-widest text-violet-500 uppercase">
              The team
            </span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-5"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-2xl font-black">{member.initial}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                    <h2 className="text-base font-bold text-gray-900">{member.name}</h2>
                    <span className="text-sm text-violet-600 font-medium">{member.role}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{member.school}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">{member.bio}</p>
                  <p className="text-sm text-gray-500">{member.highlight}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                    ⭐ {member.star}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why we built this */}
        <div className="mt-14">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs font-semibold tracking-widest text-violet-500 uppercase">
              Why we built this
            </span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              As NUS students, we kept running into the same problem: needing something for just a few days — a camera for a grad shoot, a suit for an internship interview, a drone for a project — but not wanting to buy it outright.
            </p>
            <p>
              Carousell and Facebook Marketplace exist, but neither was built for rentals. No booking calendar, no structured return process, and no real trust layer for lending valuable items to a stranger.
            </p>
            <p>
              Borlo fixes this with university email verification, campus CCTV handover locations, and a structured rental flow built from the ground up. We are the first P2P goods rental platform purpose-built for Southeast Asia's university campuses.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            Browse listings →
          </Link>
          <a
            href="mailto:hello@borlo.app"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Get in touch
          </a>
        </div>
      </main>
    </div>
  )
}
