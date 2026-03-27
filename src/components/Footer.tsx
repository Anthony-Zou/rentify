import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">

          {/* Top row — disclaimer */}
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            <span className="font-semibold text-gray-500">Disclaimer:</span> Borlo is a matching platform only. All rental agreements, payments, and item handovers are solely between the owner and renter. Borlo is not a party to any transaction and accepts no liability for loss, damage, or disputes arising between users.
          </p>

          {/* Bottom row — links + team + copyright */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/feedback" className="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors">
                Send feedback
              </Link>
            </div>
            <div className="flex flex-col sm:items-end gap-0.5">
              <p className="text-xs text-gray-300">© {new Date().getFullYear()} Borlo</p>
              <p className="text-xs text-gray-300">Made by Justin, Kenneth & Anthony · NUS MSc DFT</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
