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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          {question}
        </h1>
        {description && (
          <p className="text-lg text-gray-600 text-center mb-12">{description}</p>
        )}

        <div className="space-y-4">
          {answers.map((answer) => (
            <button
              key={answer.value}
              onClick={() => onSelect(answer.value)}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left text-lg font-medium ${
                selected === answer.value
                  ? 'border-orange-500 bg-orange-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
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
