'use client'

import { useState } from 'react'

interface PhoneStepProps {
  question: string
  description?: string
  value?: string
  onSubmit: (phone: string) => void
}

export function PhoneStep({
  question,
  description,
  value,
  onSubmit,
}: PhoneStepProps) {
  const [phone, setPhone] = useState(value || '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number')
      return
    }
    onSubmit(phone)
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
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setError('')
              }}
              placeholder="+44 123 456 7890"
              className="w-full px-6 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 shadow-sm"
              style={{ WebkitFontSmoothing: 'antialiased', borderColor: 'transparent' }}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!phone}
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
