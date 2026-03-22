export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            <span className="font-semibold text-gray-500">Disclaimer:</span> Borlo is a matching platform only. All rental agreements, payments, and item handovers are solely between the owner and renter. Borlo is not a party to any transaction and accepts no liability for loss, damage, or disputes arising between users.
          </p>
          <p className="text-xs text-gray-300 shrink-0">© {new Date().getFullYear()} Borlo</p>
        </div>
      </div>
    </footer>
  )
}
