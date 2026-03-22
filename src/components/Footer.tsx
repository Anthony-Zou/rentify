import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            <span className="font-semibold text-gray-500">Disclaimer:</span> Borlo is a matching platform only. All rental agreements, payments, and item handovers are solely between the owner and renter. Borlo is not a party to any transaction and accepts no liability for loss, damage, or disputes arising between users.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/feedback" className="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors">
              Send feedback
            </Link>
            <p className="text-xs text-gray-300">© {new Date().getFullYear()} Borlo</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
