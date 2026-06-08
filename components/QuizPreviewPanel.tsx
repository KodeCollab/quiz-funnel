'use client'

import { useEffect, useState } from 'react'
import { useQuizStore } from '@/lib/store/quiz-store'
import { QuizRenderer } from './quiz/QuizRenderer'
import { FunnelConfig, QuizStep } from '@/lib/quiz-engine/types'

interface QuizPreviewPanelProps {
  funnel: FunnelConfig
  onDelete?: () => void
  onRestart?: () => void
  previewingStep?: QuizStep | null
  onCloseStepPreview?: () => void
}

export default function QuizPreviewPanel({
  funnel,
  onDelete,
  onRestart,
  previewingStep,
  onCloseStepPreview,
}: QuizPreviewPanelProps) {
  const reset = useQuizStore((state) => state.reset)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')

  useEffect(() => {
    reset()
  }, [funnel.steps.length, reset])

  if (previewingStep) {
    return (
      <div className="sticky top-8">
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
          <div>
            <h3 className="font-bold text-gray-900">Step Preview</h3>
            <p className="text-xs text-gray-600 mt-1">Mobile view</p>
          </div>
          <button
            onClick={onCloseStepPreview}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Mobile Frame */}
        <div className="bg-white rounded-b-lg shadow-xl overflow-hidden">
          {/* Phone notch */}
          <div className="bg-black h-7 flex items-center justify-center text-white text-xs">
            <span className="ml-auto pr-4">9:41</span>
          </div>

          {/* Phone content */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-[600px] p-6">
            <div className="space-y-6">
            {/* Question */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {previewingStep.question}
              </h2>
              {previewingStep.description && (
                <p className="text-gray-600">{previewingStep.description}</p>
              )}
            </div>

            {/* Single Select Preview */}
            {previewingStep.type === 'single_select' &&
              previewingStep.answers && (
                <div className="space-y-3">
                  {previewingStep.answers.map((answer) => (
                    <button
                      key={answer.value}
                      onClick={() => setSelectedAnswer(answer.value)}
                      className={`w-full p-4 border-2 rounded-lg font-bold text-left transition-all ${
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

            {/* Multi Select Preview */}
            {(previewingStep.type === 'multi_select' ||
              previewingStep.type === 'multiple_select') &&
              previewingStep.answers && (
                <div className="space-y-3">
                  {previewingStep.answers.map((answer) => (
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
                      className={`w-full p-4 border-2 rounded-lg font-bold text-left transition-all ${
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
            {previewingStep.type === 'email_capture' && (
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
              />
            )}

            {/* Name Capture Preview */}
            {previewingStep.type === 'name_capture' && (
              <input
                type="text"
                placeholder="Your name"
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
              />
            )}

            {/* Phone Capture Preview */}
            {previewingStep.type === 'phone_capture' && (
              <input
                type="tel"
                placeholder="(555) 000-0000"
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
              />
            )}

            {/* Text Input Preview */}
            {previewingStep.type === 'text_input' && (
              <input
                type="text"
                placeholder="Enter your response"
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-orange-500"
              />
            )}

            {/* Loading Screen Preview */}
            {previewingStep.type === 'loading_screen' && (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
                <p className="text-gray-600 mt-4">{previewingStep.question}</p>
              </div>
            )}

            {/* Results Page Preview */}
            {previewingStep.type === 'results_page' && (
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
                <p className="text-gray-600">{previewingStep.question}</p>
              </div>
            )}

            </div>
          </div>
        </div>

        {/* Restart Button Outside */}
        <div className="mt-4">
          <button
            onClick={onRestart}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
          >
            Restart Preview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Live Preview</h3>
        <p className="text-xs text-gray-600 mt-1">See changes in real-time</p>
      </div>
      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[600px] flex items-center justify-center">
        <div className="w-full max-w-sm">
          <QuizRenderer
            funnel={funnel}
            key={funnel.steps.length}
            showPreviewControls={true}
            onDelete={onDelete}
            onRestart={onRestart}
          />
        </div>
      </div>
    </div>
  )
}
