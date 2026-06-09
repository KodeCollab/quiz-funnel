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
              id="phone-input"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setError('')
              }}
              placeholder="+44 123 456 7890"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!phone}
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
