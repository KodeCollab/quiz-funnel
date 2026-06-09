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
