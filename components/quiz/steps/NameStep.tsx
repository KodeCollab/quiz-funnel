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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          {question}
        </h1>
        {description && (
          <p className="text-lg text-gray-600 text-center mb-12">{description}</p>
        )}

        <div className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-orange-50"
          />

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-4 px-6 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
