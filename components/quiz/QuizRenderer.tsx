'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FunnelConfig, QuizStep } from '@/lib/quiz-engine/types'
import { resolveNextStep, calculateLeadScore } from '@/lib/quiz-engine/resolver'
import { useQuizStore } from '@/lib/store/quiz-store'
import { createSubmission } from '@/lib/supabase/queries'
import { appendToGoogleSheet } from '@/lib/integrations/google-sheets'
import { QuestionStep } from './QuestionStep'
import { ProgressBar } from './ProgressBar'
import { SingleSelectStep } from './steps/SingleSelectStep'
import { EmailStep } from './steps/EmailStep'
import { NameStep } from './steps/NameStep'
import { PhoneStep } from './steps/PhoneStep'
import { LoadingStep } from './steps/LoadingStep'
import { ResultsStep } from './steps/ResultsStep'

interface QuizRendererProps {
  funnel: FunnelConfig
  showPreviewControls?: boolean
  onDelete?: () => void
  onRestart?: () => void
}

export function QuizRenderer({
  funnel,
  showPreviewControls,
  onDelete,
  onRestart,
}: QuizRendererProps) {
  const {
    currentStepId,
    answers,
    sessionId,
    setFunnelId,
    setCurrentStep,
    setAnswer,
    goNext,
    reset,
  } = useQuizStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Initialize
  useEffect(() => {
    setFunnelId(funnel.id)
    if (!currentStepId) {
      const startId = funnel.startStepId || funnel.steps[0]?.id
      if (startId) {
        setCurrentStep(startId)
      }
    }
  }, [funnel.id, funnel.steps, currentStepId, setFunnelId, setCurrentStep])

  // Get current step
  const currentStep = funnel.steps.find((s) => s.id === currentStepId)
  const visibleSteps = funnel.steps.filter(
    (s) => s.type !== 'loading_screen' && s.type !== 'results_page'
  )
  const progress = visibleSteps.findIndex((s) => s.id === currentStepId) + 1

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading quiz...</h1>
          <p className="text-gray-600">If this persists, please refresh the page.</p>
        </div>
      </div>
    )
  }

  const handleStepSubmit = async (value: unknown) => {
    const stepId = currentStep.id
    setAnswer(stepId, value)

    // Check if this is a final step
    const isFinalStep = currentStep.type === 'phone_capture'

    if (isFinalStep) {
      setIsSubmitting(true)

      const finalAnswers = {
        ...answers,
        [stepId]: value,
      }

      // Extract lead data
      const leadScore = calculateLeadScore(finalAnswers, funnel.scoring)

      // Create submission
      const submissionId = await createSubmission(
        funnel.id,
        sessionId,
        finalAnswers,
        leadScore,
        finalAnswers.email as string,
        value as string,
        finalAnswers.name as string
      )

      // Push to Google Sheets
      if (funnel.googleSheetsId && submissionId) {
        await appendToGoogleSheet(funnel.googleSheetsId, {
          id: submissionId,
          funnelId: funnel.id,
          sessionId,
          answers: finalAnswers,
          leadScore,
          email: finalAnswers.email as string,
          phone: value as string,
          name: finalAnswers.name as string,
          completed: true,
          submittedAt: new Date().toISOString(),
        })
      }

      setIsSubmitting(false)
      goNext('loading')
    } else {
      // Move to next step based on branching logic
      const nextStepId = resolveNextStep(currentStep, value, {
        ...answers,
        [stepId]: value,
      })
      goNext(nextStepId)
    }
  }

  const handleLoadingComplete = () => {
    goNext('results')
  }

  const handleRestart = () => {
    reset()
    setFunnelId(funnel.id)
    setCurrentStep(funnel.startStepId)
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-4 gap-2">
        <ProgressBar current={progress} total={visibleSteps.length} />
      </div>

      <AnimatePresence mode="wait">
        <QuestionStep key={currentStepId} stepKey={currentStepId}>
          {currentStep.type === 'single_select' && (
            <SingleSelectStep
              question={currentStep.question}
              description={currentStep.description}
              answers={currentStep.answers || []}
              selected={answers[currentStepId] as string}
              onSelect={handleStepSubmit}
            />
          )}

          {currentStep.type === 'email_capture' && (
            <EmailStep
              question={currentStep.question}
              description={currentStep.description}
              value={answers[currentStepId] as string}
              onSubmit={handleStepSubmit}
            />
          )}

          {currentStep.type === 'name_capture' && (
            <NameStep
              question={currentStep.question}
              description={currentStep.description}
              value={answers[currentStepId] as string}
              onSubmit={handleStepSubmit}
            />
          )}

          {currentStep.type === 'phone_capture' && (
            <PhoneStep
              question={currentStep.question}
              description={currentStep.description}
              value={answers[currentStepId] as string}
              onSubmit={handleStepSubmit}
            />
          )}

          {currentStep.type === 'loading_screen' && (
            <LoadingStep
              question={currentStep.question}
              onComplete={handleLoadingComplete}
            />
          )}

          {currentStep.type === 'results_page' && (
            <ResultsStep
              question={currentStep.question}
              description={currentStep.description}
            />
          )}
        </QuestionStep>
      </AnimatePresence>
    </div>
  )
}
