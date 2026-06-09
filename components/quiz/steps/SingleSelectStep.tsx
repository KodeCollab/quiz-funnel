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
    <div className="flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>
        {description && (
          <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <div className="space-y-4 mt-8 md:mt-12 px-2">
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
