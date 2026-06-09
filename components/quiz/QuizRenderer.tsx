'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FunnelConfig, QuizStep } from '@/lib/quiz-engine/types'
import { resolveNextStep, calculateLeadScore } from '@/lib/quiz-engine/resolver'
import { useQuizStore } from '@/lib/store/quiz-store'
import { createSubmission, updateSubmission } from '@/lib/supabase/queries'
import { appendToGoogleSheet } from '@/lib/integrations/google-sheets'
import { QuestionStep } from './QuestionStep'
import { ProgressBar } from './ProgressBar'
import { SingleSelectStep } from './steps/SingleSelectStep'
import { MultipleSelectStep } from './steps/MultipleSelectStep'
import { TextInputStep } from './steps/TextInputStep'
import { EmailStep } from './steps/EmailStep'
import { NameStep } from './steps/NameStep'
import { PhoneStep } from './steps/PhoneStep'
import { AddressStep } from './steps/AddressStep'
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
    submissionId,
    history,
    setFunnelId,
    setCurrentStep,
    setAnswer,
    setSubmissionId,
    goNext,
    goBack,
    reset,
  } = useQuizStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Initialize
  useEffect(() => {
    setFunnelId(funnel.id)
    if (!currentStepId) {
      // Verify startStepId is valid, otherwise use first step
      let startId = funnel.startStepId
      if (!funnel.steps.some((s) => s.id === startId)) {
        startId = funnel.steps[0]?.id || ''
      }
      if (startId) {
        setCurrentStep(startId)
      }
    }
  }, [funnel.id, funnel.steps])

  // Get current step - validate step exists in current funnel, default to first step if not
  const effectiveStepId = (currentStepId && funnel.steps.some((s) => s.id === currentStepId))
    ? currentStepId
    : funnel.steps[0]?.id || ''
  const currentStep = funnel.steps.find((s) => s.id === effectiveStepId)

  console.log('[QuizRenderer] currentStepId:', currentStepId, 'effectiveStepId:', effectiveStepId, 'available steps:', funnel.steps.map(s => `${s.id}(${s.type})`), 'currentStep:', currentStep?.question)
  const visibleSteps = funnel.steps.filter(
    (s) => s.type !== 'loading_screen'
  )
  const currentVisibleIndex = visibleSteps.findIndex((s) => s.id === currentStepId)
  // If current step is visible, show its progress; if hidden step, show full progress
  const progress = currentVisibleIndex >= 0 ? currentVisibleIndex + 1 : visibleSteps.length

  if (!currentStep) {
    console.error(`[QuizRenderer] Step not found. currentStepId=${currentStepId}, available steps:`, funnel.steps.map(s => s.id))
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading quiz...</h1>
          <p className="text-gray-600">If this persists, please refresh the page.</p>
        </div>
      </div>
    )
  }

  const extractLeadData = (allAnswers: Record<string, unknown>) => {
    let email = ''
    let name = ''
    let phone = ''

    for (const step of funnel.steps) {
      if (step.type === 'email_capture' && allAnswers[step.id]) {
        email = String(allAnswers[step.id])
      } else if (step.type === 'name_capture' && allAnswers[step.id]) {
        name = String(allAnswers[step.id])
      } else if (step.type === 'phone_capture' && allAnswers[step.id]) {
        phone = String(allAnswers[step.id])
      }
    }

    return { email, name, phone }
  }

  const handleStepSubmit = async (value: unknown) => {
    console.log('[handleStepSubmit] Step submitted:', {
      stepId: currentStep.id,
      stepType: currentStep.type,
      value,
      currentAnswers: answers,
    })

    const stepId = currentStep.id

    // Build final answers with all previous answers + current answer
    const allAnswers = {
      ...answers,
      [stepId]: value,
    }

    // Update store with the new answer
    setAnswer(stepId, value)

    // Get next step
    const nextStepId = resolveNextStep(currentStep, value, allAnswers, funnel.steps)
    const nextStep = funnel.steps.find((s) => s.id === nextStepId)
    const isMovingToResults = nextStep?.type === 'results_page'

    const finalAnswers = allAnswers

    // Progressive saving
    console.log('[handleStepSubmit] Saving step data progressively...')
    setIsSubmitting(true)

    console.log('[handleStepSubmit] Store answers before submission:', answers)
    console.log('[handleStepSubmit] Final accumulated answers:', finalAnswers)
    console.log('[handleStepSubmit] Answer keys in finalAnswers:', Object.keys(finalAnswers))

    // Extract lead data from answers
    const { email, name, phone } = extractLeadData(finalAnswers)
    console.log('[handleStepSubmit] Extracted lead data:', { email, name, phone })

    const leadScore = calculateLeadScore(finalAnswers, funnel.scoring)
    console.log('[handleStepSubmit] Calculated lead score:', leadScore)

    try {
      let currentSubmissionId = submissionId

      if (!currentSubmissionId) {
        // Create submission on first step
        console.log('[handleStepSubmit] Creating submission in Supabase...')
        currentSubmissionId = await createSubmission(
          funnel.id,
          sessionId,
          finalAnswers,
          leadScore,
          email,
          phone,
          name
        )
        console.log('[handleStepSubmit] Submission created:', currentSubmissionId)
        if (currentSubmissionId) {
          setSubmissionId(currentSubmissionId)
        }
      } else {
        // Update existing submission
        console.log('[handleStepSubmit] Updating submission:', currentSubmissionId)
        await updateSubmission(
          currentSubmissionId,
          finalAnswers,
          leadScore,
          email,
          phone,
          name,
          undefined,
          isMovingToResults ? true : false
        )
        console.log('[handleStepSubmit] Submission updated')
      }

      // Push to Google Sheets
      if (funnel.googleSheetsId && currentSubmissionId) {
        console.log('[handleStepSubmit] Pushing to Google Sheets:', funnel.googleSheetsId)
        await appendToGoogleSheet(funnel.googleSheetsId, {
          id: currentSubmissionId,
          funnelId: funnel.id,
          sessionId,
          answers: finalAnswers,
          leadScore,
          email,
          phone,
          name,
          completed: isMovingToResults,
          submittedAt: new Date().toISOString(),
        })
        console.log('[handleStepSubmit] Google Sheets update complete')
      }
    } catch (error) {
      console.error('[handleStepSubmit] Error during submission:', error)
    }

    setIsSubmitting(false)

    // Move to next step
    console.log('[handleStepSubmit] Moving to next step:', nextStepId)
    goNext(nextStepId)
  }

  const handleLoadingComplete = () => {
    // Use resolver to determine next step, just like regular step submission
    const nextStepId = resolveNextStep(currentStep, undefined, answers, funnel.steps)
    goNext(nextStepId)
  }

  const handleRestart = () => {
    reset()
    setFunnelId(funnel.id)
    setCurrentStep(funnel.startStepId)
  }

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'single_select':
        return (
          <SingleSelectStep
            question={currentStep.question}
            description={currentStep.description}
            answers={currentStep.answers || []}
            selected={answers[currentStepId] as string}
            onSelect={handleStepSubmit}
          />
        )

      case 'multiple_select':
      case 'multi_select':
        return (
          <MultipleSelectStep
            question={currentStep.question}
            description={currentStep.description}
            answers={currentStep.answers || []}
            selected={(answers[currentStepId] as string)?.split(',').filter(Boolean) || []}
            onSubmit={handleStepSubmit}
          />
        )

      case 'text_input':
      case 'textarea':
        return (
          <TextInputStep
            question={currentStep.question}
            description={currentStep.description}
            value={answers[currentStepId] as string}
            placeholder={currentStep.placeholder}
            onSubmit={handleStepSubmit}
          />
        )

      case 'email_capture':
        return (
          <EmailStep
            question={currentStep.question}
            description={currentStep.description}
            value={answers[currentStepId] as string}
            onSubmit={handleStepSubmit}
          />
        )

      case 'name_capture':
        return (
          <NameStep
            question={currentStep.question}
            description={currentStep.description}
            value={answers[currentStepId] as string}
            onSubmit={handleStepSubmit}
          />
        )

      case 'phone_capture':
        return (
          <PhoneStep
            question={currentStep.question}
            description={currentStep.description}
            value={answers[currentStepId] as string}
            onSubmit={handleStepSubmit}
          />
        )

      case 'address_capture':
      case 'zipcode_capture':
      case 'city_capture':
      case 'housenumber_capture':
      case 'country_capture':
        return (
          <AddressStep
            type={currentStep.type as any}
            question={currentStep.question}
            description={currentStep.description}
            value={answers[currentStepId] as string}
            onSubmit={handleStepSubmit}
          />
        )

      case 'loading_screen':
        return (
          <LoadingStep
            question={currentStep.question}
            onComplete={handleLoadingComplete}
            duration={(currentStep as any).duration || 2000}
          />
        )

      case 'results_page':
        return (
          <ResultsStep
            question={currentStep.question}
            description={currentStep.description}
            ctaText={currentStep.ctaText}
            ctaLink={currentStep.ctaLink}
          />
        )

      default:
        return (
          <div className="flex items-center justify-center min-h-96 bg-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Unknown step type</h1>
              <p className="text-gray-600 mt-2">{currentStep.type}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full flex flex-col overflow-x-hidden relative min-h-screen">
      <ProgressBar current={progress} total={visibleSteps.length} />

      <div className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <QuestionStep key={currentStepId} stepKey={currentStepId}>
            {renderStepContent()}
          </QuestionStep>
        </AnimatePresence>
      </div>

      {/* Back Button */}
      {history.length > 1 && (
        <div className="absolute bottom-8 left-8">
          <button
            onClick={goBack}
            className="text-orange-500 hover:underline text-sm font-bold"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
