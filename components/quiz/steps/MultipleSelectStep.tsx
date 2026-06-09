'use client'

import { useState } from 'react'
import { Answer } from '@/lib/quiz-engine/types'

interface MultipleSelectStepProps {
  question: string
  description?: string
  answers: Answer[]
  selected?: string[]
  onSubmit: (values: string[]) => void
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
    <div className="flex flex-col items-center justify-center min-h-96 bg-white p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-full">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-xl text-gray-600 text-center mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-4 mt-8 md:mt-12 px-2">
          {answers.map((answer) => (
            <button
              key={answer.value}
              onClick={() => toggleSelection(answer.value)}
              className="btn-orange-block flex items-center justify-center gap-3"
            >
              <span className="text-xl">{selections.includes(answer.value) ? '☑' : '☐'}</span>
              {answer.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSubmit(selections)}
          disabled={selections.length === 0}
          className="btn-orange-block"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
