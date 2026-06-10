'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    reset()
    const step = previewingStep || funnel.steps.find(s => s.type !== 'loading_screen')
    if (step) {
      // Set step directly with only current step in history (no back button)
      useQuizStore.setState({ currentStepId: step.id, history: [step.id] })
    }
  }, [previewingStep, funnel.steps.length, reset])

  return (
    <div className="sticky top-8 h-[calc(100vh-32px)] flex flex-col">
      <div className="bg-gray-100 p-4 border-b border-gray-200 rounded-t-lg">
        <div>
          <h3 className="font-bold text-gray-900">Step Preview</h3>
          <p className="text-xs text-gray-600 mt-1">Mobile view</p>
        </div>
      </div>

      {/* Mobile Frame */}
      <div className="bg-white rounded-b-lg shadow-xl overflow-hidden overflow-x-hidden flex flex-col" style={{ width: '402px', height: '874px' }}>
        {/* Phone notch */}
        <div className="bg-black h-7 flex items-center justify-between px-6 py-2 text-white text-xs flex-shrink-0 mr-4">
          <span></span>
          <span>9:41</span>
        </div>

        {/* Phone content */}
        <div className="bg-white flex-1 overflow-hidden w-full">
          <QuizRenderer
            funnel={funnel}
            key={funnel.steps.length}
            showPreviewControls={false}
            onDelete={onDelete}
            onRestart={onRestart}
          />
        </div>
      </div>

      {/* Restart Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => {
            reset()
            const firstStep = funnel.steps.find(s => s.type !== 'loading_screen')
            if (firstStep) {
              useQuizStore.setState({ currentStepId: firstStep.id, history: [firstStep.id] })
            }
          }}
          className="btn-sm-orange"
        >
          Restart
        </button>
      </div>
    </div>
  )
}
