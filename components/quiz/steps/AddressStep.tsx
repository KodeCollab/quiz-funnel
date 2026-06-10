'use client'

import { useState } from 'react'

interface AddressStepProps {
  type: 'address_capture' | 'zipcode_capture' | 'city_capture' | 'housenumber_capture' | 'country_capture'
  question: string
  description?: string
  value?: string
  onSubmit: (value: string) => void
}

const placeholderByType = {
  address_capture: 'Enter your street address',
  zipcode_capture: 'Enter your postal code',
  city_capture: 'Enter your city',
  housenumber_capture: 'Enter your house number',
  country_capture: 'Enter your country',
}

const labelByType = {
  address_capture: 'Address',
  zipcode_capture: 'Postal Code',
  city_capture: 'City',
  housenumber_capture: 'House Number',
  country_capture: 'Country',
}

export function AddressStep({
  type,
  question,
  description,
  value,
  onSubmit,
}: AddressStepProps) {
  const [input, setInput] = useState(value || '')

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input)
    }
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
        <div className="input-container-block">
          <input
            id={`${type}-input`}
            name={labelByType[type].toLowerCase().replace(/\s+/g, '-')}
            type="text"
            autoComplete={
              type === 'zipcode_capture' ? 'postal-code' :
              type === 'city_capture' ? 'address-level2' :
              type === 'country_capture' ? 'country-name' :
              type === 'housenumber_capture' ? 'street-address' :
              'street-address'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderByType[type]}
            style={{ WebkitFontSmoothing: 'antialiased' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="btn-orange-block"
          style={{ WebkitFontSmoothing: 'antialiased' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
