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
    <div className="flex flex-col items-center justify-center w-full max-w-2xl" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }} data-step-content>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight" style={{ WebkitFontSmoothing: 'antialiased' }}>
        {question}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
      )}

      <div className="space-y-3 w-full">
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
        <button
          onClick={() => onSubmit(selections.join(','))}
          disabled={selections.length === 0}
          className="btn-orange-block mt-12 md:mt-16"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
