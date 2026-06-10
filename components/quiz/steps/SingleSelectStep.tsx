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
    <div className="flex flex-col items-center justify-center w-full max-w-2xl" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight" style={{ WebkitFontSmoothing: 'antialiased' }}>
        {question}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
      )}

      <div className="space-y-3 w-full">
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
  )
}
