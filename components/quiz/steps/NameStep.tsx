'use client'

import { useState } from 'react'

interface NameStepProps {
  question: string
  description?: string
  value?: string
  onSubmit: (name: string) => void
}

export function NameStep({
  question,
  description,
  value,
  onSubmit,
}: NameStepProps) {
  const [name, setName] = useState(value || '')

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-center leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-xl text-gray-600 text-center mb-12 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-6 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 shadow-sm"
            style={{ WebkitFontSmoothing: 'antialiased', borderColor: 'transparent' }}
          />

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-4 px-6 bg-orange-500 text-white font-semibold text-lg rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md border-transparent"
            style={{ WebkitFontSmoothing: 'antialiased' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
