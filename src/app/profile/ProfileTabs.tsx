'use client'

import { useState } from 'react'

export default function ProfileTabs({
  tabs,
  counts,
}: {
  tabs: { label: string; content: React.ReactNode }[]
  counts?: (number | null)[]
}) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              active === i
                ? 'text-violet-600 border-b-2 border-violet-600 -mb-px'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {counts?.[i] != null && counts[i]! > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                active === i ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[i]}
              </span>
            )}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  )
}
