'use client'

import { useState } from 'react'

interface EmailStepProps {
  question: string
  description?: string
  value?: string
  onSubmit: (email: string) => void
}

export function EmailStep({
  question,
  description,
  value,
  onSubmit,
}: EmailStepProps) {
  const [email, setEmail] = useState(value || '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      return
    }
    onSubmit(email)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
          <div className="input-container-block">
            <input
              id="email-input"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="you@example.com"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!email}
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
