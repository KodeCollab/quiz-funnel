'use client'

import { useState } from 'react'

interface TextInputStepProps {
  question: string
  description?: string
  value?: string
  placeholder?: string
  onSubmit: (value: string) => void
}

export function TextInputStep({
  question,
  description,
  value,
  placeholder = 'Enter your answer...',
  onSubmit,
}: TextInputStepProps) {
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
        <div className="input-container-block w-full">
          <input
            id="text-input"
            name="text"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            style={{ WebkitFontSmoothing: 'antialiased' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                handleSubmit()
              }
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="btn-orange-block w-full"
          style={{ WebkitFontSmoothing: 'antialiased' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
