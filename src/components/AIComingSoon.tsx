'use client'

import { useState } from 'react'

type Props = {
  label: string
  description: string
  children: React.ReactNode
}

export default function AIComingSoon({ label, description, children }: Props) {
  const [show, setShow] = useState(false)

  function handleClick() {
    setShow(true)
    setTimeout(() => setShow(false), 3000)
  }

  return (
    <div className="relative">
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      {show && (
        <div className="absolute z-50 left-0 top-full mt-2 w-72 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl">
          <div className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">✦</span>
            <div>
              <p className="font-semibold text-white mb-0.5">{label} — Coming soon</p>
              <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />
        </div>
      )}
    </div>
  )
}
