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
    <div className="flex flex-col items-center justify-center w-full h-full px-4 md:px-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3 text-center leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-2 mt-4 md:mt-6">
          {answers.map((answer) => (
            <button
              key={answer.value}
              onClick={() => onSelect(answer.value)}
              className="btn-orange-block"
            >
              {answer.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
