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
    <div className="flex flex-col items-center justify-center w-full max-w-2xl" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight" style={{ WebkitFontSmoothing: 'antialiased' }}>
        {question}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
      )}

      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <div className="input-container-block w-full">
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
          className="btn-orange-block w-full"
          style={{ WebkitFontSmoothing: 'antialiased' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
