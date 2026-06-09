'use client'

import { useEffect, useState } from 'react'
import { useQuizStore } from '@/lib/store/quiz-store'
import { QuizRenderer } from './quiz/QuizRenderer'
import { FunnelConfig, QuizStep } from '@/lib/quiz-engine/types'
import { SingleSelectStep } from './quiz/steps/SingleSelectStep'
import { MultipleSelectStep } from './quiz/steps/MultipleSelectStep'
import { EmailStep } from './quiz/steps/EmailStep'
import { NameStep } from './quiz/steps/NameStep'
import { PhoneStep } from './quiz/steps/PhoneStep'
import { LoadingStep } from './quiz/steps/LoadingStep'
import { ResultsStep } from './quiz/steps/ResultsStep'

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
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [autoPreviewStep, setAutoPreviewStep] = useState<QuizStep | null>(funnel.steps[0] || null)

  useEffect(() => {
    reset()
    setCurrentStepIndex(0)
    setAutoPreviewStep(funnel.steps[0] || null)
  }, [funnel.steps.length, reset])

  useEffect(() => {
    const step = previewingStep || autoPreviewStep
    if (step) {
      const stepIndex = funnel.steps.findIndex(s => s.id === step.id)
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex)
      }
    }
  }, [previewingStep, autoPreviewStep, funnel.steps])

  const handleNextStep = () => {
    if (currentStepIndex < funnel.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      setSelectedAnswer('')
    }
  }

  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(value)
    setTimeout(handleNextStep, 300)
  }

  const handleBackStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      setSelectedAnswer('')
    }
  }

  const effectivePreviewStep = previewingStep || autoPreviewStep

  if (effectivePreviewStep) {
    const currentStep = funnel.steps[currentStepIndex]
    const totalSteps = funnel.steps.length
    const progress = ((currentStepIndex + 1) / totalSteps) * 100

    const renderStep = () => {
      if (!currentStep) return null

      switch (currentStep.type) {
        case 'single_select':
          return (
            <div className="relative flex flex-col items-center justify-center h-full bg-white px-4 lg:px-12 py-12 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="space-y-4 mt-8 md:mt-12 px-2">
                  {currentStep.answers?.map((answer) => (
                    <button
                      key={answer.value}
                      onClick={() => handleSelectAnswer(answer.value)}
                      className="btn-orange-block"
                    >
                      {answer.label}
                    </button>
                  ))}
                </div>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'multiple_select':
        case 'multi_select':
          return (
            <div className="relative flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="space-y-4 mt-8 md:mt-12 px-2">
                  {currentStep.answers?.map((answer) => {
                    const isSelected = selectedAnswer.includes(answer.value)
                    return (
                      <button
                        key={answer.value}
                        onClick={() => {
                          if (isSelected) {
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
                        className={`flex items-center justify-center gap-3 ${
                          isSelected ? 'btn-orange-block' : 'btn-gray-block'
                        }`}
                      >
                        <span className="text-xl">{isSelected ? '☑' : '☐'}</span>
                        {answer.label}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={selectedAnswer.length === 0}
                  className="btn-orange-block mt-12"
                >
                  Continue
                </button>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'email_capture':
          return (
            <div className="relative flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
                  <div className="input-container-block">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                    />
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="btn-orange-block"
                  >
                    Continue
                  </button>
                </div>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'name_capture':
          return (
            <div className="relative flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
                  <div className="input-container-block">
                    <input
                      type="text"
                      placeholder="Your full name"
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                    />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="btn-orange-block"
                  >
                    Continue
                  </button>
                </div>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'phone_capture':
          return (
            <div className="relative flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
                  <div className="input-container-block">
                    <input
                      type="tel"
                      placeholder="+44 123 456 7890"
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                    />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="btn-orange-block"
                  >
                    Continue
                  </button>
                </div>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'address_capture':
        case 'zipcode_capture':
        case 'city_capture':
        case 'housenumber_capture':
        case 'country_capture':
          return (
            <div className="relative flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
                  <div className="input-container-block">
                    <input
                      type="text"
                      placeholder="Enter information"
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                    />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="btn-orange-block"
                  >
                    Continue
                  </button>
                </div>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'text_input':
        case 'textarea':
          return (
            <div className="relative flex flex-col items-center justify-center min-h-96 bg-white p-4 md:p-6 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full max-w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>
                {currentStep.description && (
                  <p className="text-base md:text-lg text-gray-600 text-center mb-8 md:mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}

                <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
                  <div className="input-container-block">
                    <input
                      type="text"
                      placeholder={currentStep.placeholder || 'Enter your answer...'}
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                    />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="btn-orange-block"
                  >
                    Continue
                  </button>
                </div>
              </div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackStep}
                  className="absolute bottom-4 left-4 text-orange-500 hover:underline text-sm font-bold"
                >
                  ← Back
                </button>
              )}
            </div>
          )
        case 'loading_screen':
          return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-white p-4 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full text-center px-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>

                <div className="flex justify-center items-center">
                  <div className="w-20 h-20 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" style={{ borderColor: 'transparent' }} />
                </div>
              </div>
            </div>
          )
        case 'results_page':
          return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-white p-4 antialiased overflow-x-hidden" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
              <div className="w-full text-center px-2">
                <div className="mb-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
                    <svg
                      className="w-12 h-12 text-green-600 select-none"
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
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight select-none px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                  {currentStep.question}
                </h1>

                {currentStep.description && (
                  <p className="text-xl text-gray-600 mb-12 leading-relaxed px-2" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    {currentStep.description}
                  </p>
                )}
              </div>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className="sticky top-8 h-[calc(100vh-32px)] flex flex-col">
        <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-lg">
          <div>
            <h3 className="font-bold text-gray-900">Step Preview</h3>
            <p className="text-xs text-gray-600 mt-1">Mobile view</p>
          </div>
        </div>

        {/* Mobile Frame */}
        <div className="bg-white rounded-b-lg shadow-xl overflow-hidden overflow-x-hidden flex-1 flex flex-col">
          {/* Phone notch */}
          <div className="bg-black h-7 flex items-center justify-between px-6 py-2 text-white text-xs flex-shrink-0">
            <span></span>
            <span>9:41</span>
          </div>

          {/* Phone content */}
          <div className="bg-white flex-1 overflow-hidden w-full">
            {renderStep()}
          </div>

          {/* Progress Bar at Bottom */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Step {currentStepIndex + 1} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Restart Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setCurrentStepIndex(0)
              setSelectedAnswer('')
            }}
            className="btn-sm-orange"
          >
            Restart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-8 h-[calc(100vh-32px)] flex flex-col">
      <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
        <div>
          <h3 className="font-bold text-gray-900">Live Preview</h3>
          <p className="text-xs text-gray-600 mt-1">Mobile view</p>
        </div>
      </div>

      {/* Mobile Frame */}
      <div className="bg-white rounded-b-lg shadow-xl overflow-hidden overflow-x-hidden flex-1 flex flex-col">
        {/* Phone notch */}
        <div className="bg-black h-7 flex items-center justify-between px-4 text-white text-xs flex-shrink-0">
          <span></span>
          <span>9:41</span>
        </div>

        {/* Phone content */}
        <div className="bg-white flex-1 overflow-hidden w-full">
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
