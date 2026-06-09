'use client'

import { useState } from 'react'
import { Answer } from '@/lib/quiz-engine/types'

interface MultipleSelectStepProps {
  question: string
  description?: string
  answers: Answer[]
  selected?: string[]
  onSubmit: (values: string) => void
}

export function MultipleSelectStep({
  question,
  description,
  answers,
  selected = [],
  onSubmit,
}: MultipleSelectStepProps) {
  const [selections, setSelections] = useState<string[]>(selected)

  const toggleSelection = (value: string) => {
    setSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
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

        <div className="space-y-4 mt-8 md:mt-12 px-2">
          {answers.map((answer) => {
            const isSelected = selections.includes(answer.value)
            return (
              <button
                key={answer.value}
                onClick={() => toggleSelection(answer.value)}
                className={`flex items-center justify-center gap-3 ${
                  isSelected ? 'btn-orange-block' : 'btn-gray-block'
                }`}
              >
                <span className="text-xl">{isSelected ? '☑' : '☐'}</span>
                {answer.label}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onSubmit(selections.join(','))}
          disabled={selections.length === 0}
          className="btn-orange-block mt-12"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
