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
    <div className="flex flex-col items-center justify-center w-full h-full px-4 md:px-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-full overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 text-center leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-2 mt-4 md:mt-6">
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
          className="btn-orange-block mt-6 md:mt-8"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
