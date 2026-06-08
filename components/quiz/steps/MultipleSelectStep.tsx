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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-center leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-xl text-gray-600 text-center mb-12 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-6 mb-6">
          {answers.map((answer) => (
            <button
              key={answer.value}
              onClick={() => toggleSelection(answer.value)}
              className={`w-full p-6 rounded-xl transition-all text-center text-lg font-semibold shadow-sm hover:shadow-md border-transparent flex items-center justify-center gap-3 ${
                selections.includes(answer.value)
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              <span className="text-xl">{selections.includes(answer.value) ? '☑' : '☐'}</span>
              {answer.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSubmit(selections)}
          disabled={selections.length === 0}
          className="w-full p-6 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors shadow-sm hover:shadow-md"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
