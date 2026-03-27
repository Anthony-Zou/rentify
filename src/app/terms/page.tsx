import Link from 'next/link'
import Header from '@/components/Header'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'Terms of Service — Borlo',
}

export default async function TermsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 inline-block mb-8">
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of terms</h2>
            <p>By creating an account or using Borlo, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Eligibility</h2>
            <p>Borlo is available to students with a valid university email address ending in <strong>.edu.sg</strong> or <strong>.edu</strong>. You must be at least 18 years old to use the platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Borlo is a matching platform only</h2>
            <p>Borlo connects owners and renters. We are not a party to any rental transaction. All agreements, payments, and arrangements are made directly between users. Borlo is not responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>The condition, safety, or legality of any listed item.</li>
              <li>Loss, damage, theft, or disputes arising from a rental.</li>
              <li>Any failure by either party to meet their agreed obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Owner responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Only list items you own and have the right to rent out.</li>
              <li>Ensure your listing description and photos are accurate.</li>
              <li>Honour accepted rental requests and communicate promptly.</li>
              <li>Meet the renter at a safe, on-campus location with CCTV coverage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Renter responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Return all items in the same condition as received, on or before the agreed end date.</li>
              <li>Treat the owner's property with care and respect.</li>
              <li>Agree on any deposit or payment terms directly with the owner before collection.</li>
              <li>Show your student ID at handover as requested.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Prohibited conduct</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Listing items that are illegal, dangerous, or that you do not own.</li>
              <li>Using the platform for commercial resale or non-personal use.</li>
              <li>Harassing, deceiving, or misrepresenting yourself to other users.</li>
              <li>Attempting to circumvent the university email verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Account suspension</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, at our sole discretion, with or without prior notice.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">8. Limitation of liability</h2>
            <p>To the fullest extent permitted by law, Borlo and its founders shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform or any rental transaction.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">9. Governing law</h2>
            <p>These terms are governed by the laws of Singapore. Any disputes shall be subject to the exclusive jurisdiction of the courts of Singapore.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:hello@borlo.app" className="text-violet-600 hover:underline">hello@borlo.app</a>.</p>
          </section>

        </div>
      </main>
    </div>
  )
}
