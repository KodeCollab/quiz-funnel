'use client'

import { Answer } from '@/lib/quiz-engine/types'

interface SingleSelectStepProps {
  question: string
  description?: string
  answers: Answer[]
  selected?: string
  onSelect: (value: string) => void
}

export function SingleSelectStep({
  question,
  description,
  answers,
  selected,
  onSelect,
}: SingleSelectStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-center leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-xl text-gray-600 text-center mb-12 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-6">
          {answers.map((answer) => (
            <button
              key={answer.value}
              onClick={() => onSelect(answer.value)}
              className={`w-full p-6 rounded-xl transition-all text-center text-lg font-semibold shadow-sm hover:shadow-md border-transparent ${
                selected === answer.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {answer.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
