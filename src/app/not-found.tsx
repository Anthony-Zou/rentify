import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-900 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-8">
          This listing may have been removed, or the link is incorrect.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to listings
        </Link>
      </div>
    </div>
  )
}
