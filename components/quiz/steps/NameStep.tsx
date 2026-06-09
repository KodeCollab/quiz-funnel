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
    <div className="flex flex-col items-center justify-center w-full h-full px-4 md:px-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 text-center leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="flex flex-col items-center justify-center mt-4 md:mt-6">
          <div className="input-container-block">
            <input
              id="name-input"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="btn-orange-block"
            style={{ WebkitFontSmoothing: 'antialiased' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
