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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          {question}
        </h1>
        {description && (
          <p className="text-lg text-gray-600 text-center mb-12">{description}</p>
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
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-orange-50"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!phone}
            className="w-full py-4 px-6 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
