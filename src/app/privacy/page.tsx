import Link from 'next/link'
import Header from '@/components/Header'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'Privacy Policy — Borlo',
}

export default async function PrivacyPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 inline-block mb-8">
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Who we are</h2>
            <p>Borlo is a peer-to-peer rental marketplace for university students in Singapore, operated by the Borlo founding team. You can reach us at <a href="mailto:hello@borlo.app" className="text-violet-600 hover:underline">hello@borlo.app</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>University email address</strong> — used to verify you are a student and to send you booking notifications.</li>
              <li><strong>Profile information</strong> — your name, Telegram handle, and university, which you provide voluntarily.</li>
              <li><strong>Listing content</strong> — photos, descriptions, and prices you upload when posting an item.</li>
              <li><strong>Rental requests</strong> — dates, messages, and status of requests you send or receive.</li>
              <li><strong>Login activity</strong> — login count and last login time, used to understand platform usage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate the platform and facilitate rentals between students.</li>
              <li>To send email notifications about booking requests and updates (via Resend).</li>
              <li>To verify university identity and prevent misuse.</li>
              <li>To improve the product based on usage patterns.</li>
            </ul>
            <p className="mt-3">We do not sell your data. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Third-party services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — database and authentication hosting. Your data is stored on Supabase servers (AWS, Singapore region where available).</li>
              <li><strong>Resend</strong> — transactional email delivery for booking notifications.</li>
              <li><strong>Vercel</strong> — web hosting and content delivery.</li>
              <li><strong>Cloudflare</strong> — DNS and traffic protection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Data retention</h2>
            <p>Your account data is retained as long as your account is active. You may request deletion of your account and associated data at any time by emailing <a href="mailto:hello@borlo.app" className="text-violet-600 hover:underline">hello@borlo.app</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:hello@borlo.app" className="text-violet-600 hover:underline">hello@borlo.app</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Changes to this policy</h2>
            <p>We may update this policy from time to time. Significant changes will be communicated via email or a notice on the platform.</p>
          </section>

        </div>
      </main>
    </div>
  )
}
