'use client'

import { QuizStep } from '@/lib/quiz-engine/types'
import { useState } from 'react'

interface StepPreviewProps {
  step: QuizStep
  onClose: () => void
}

export default function StepPreview({ step, onClose }: StepPreviewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Preview Step</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-8">
          {/* Question */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{step.question}</h1>

          {step.description && (
            <p className="text-lg text-gray-600 mb-8">{step.description}</p>
          )}

          {/* Single Select Preview */}
          {step.type === 'single_select' && step.answers && (
            <div className="space-y-4">
              {step.answers.map((answer) => (
                <button
                  key={answer.value}
                  onClick={() => setSelectedAnswer(answer.value)}
                  className={`w-full p-4 border-2 rounded-lg font-bold text-lg transition-all text-left ${
                    selectedAnswer === answer.value
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 hover:border-orange-500 text-gray-900'
                  }`}
                >
                  {answer.label}
                </button>
              ))}
            </div>
          )}

          {/* Multiple Select Preview */}
          {step.type === 'multiple_select' && step.answers && (
            <div className="space-y-4">
              {step.answers.map((answer) => (
                <button
                  key={answer.value}
                  onClick={() => {
                    if (selectedAnswer.includes(answer.value)) {
                      setSelectedAnswer(
                        selectedAnswer
                          .split(',')
                          .filter((v) => v !== answer.value)
                          .join(',')
                      )
                    } else {
                      setSelectedAnswer(
                        selectedAnswer
                          ? `${selectedAnswer},${answer.value}`
                          : answer.value
                      )
                    }
                  }}
                  className={`w-full p-4 border-2 rounded-lg font-bold text-lg transition-all text-left ${
                    selectedAnswer.includes(answer.value)
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 hover:border-orange-500 text-gray-900'
                  }`}
                >
                  ☐ {answer.label}
                </button>
              ))}
            </div>
          )}

          {/* Email Capture Preview */}
          {step.type === 'email_capture' && (
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
            />
          )}

          {/* Name Capture Preview */}
          {step.type === 'name_capture' && (
            <input
              type="text"
              placeholder="Your name"
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
            />
          )}

          {/* Phone Capture Preview */}
          {step.type === 'phone_capture' && (
            <input
              type="tel"
              placeholder="(555) 000-0000"
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
            />
          )}

          {/* Text Input Preview */}
          {step.type === 'text_input' && (
            <input
              type="text"
              placeholder="Enter your response"
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
            />
          )}

          {/* Loading Screen Preview */}
          {step.type === 'loading_screen' && (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
              <p className="text-gray-600 mt-4">{step.question}</p>
            </div>
          )}

          {/* Results Page Preview */}
          {step.type === 'results_page' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600">{step.question}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
