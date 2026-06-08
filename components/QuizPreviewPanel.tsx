'use client'

import { useEffect } from 'react'
import { useQuizStore } from '@/lib/store/quiz-store'
import { QuizRenderer } from './quiz/QuizRenderer'
import { FunnelConfig } from '@/lib/quiz-engine/types'

interface QuizPreviewPanelProps {
  funnel: FunnelConfig
}

export default function QuizPreviewPanel({ funnel }: QuizPreviewPanelProps) {
  const reset = useQuizStore((state) => state.reset)

  useEffect(() => {
    reset()
  }, [funnel.steps.length, reset])

  return (
    <div className="sticky top-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Live Preview</h3>
        <p className="text-xs text-gray-600 mt-1">See changes in real-time</p>
      </div>
      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[600px] flex items-center justify-center">
        <div className="w-full max-w-sm">
          <QuizRenderer funnel={funnel} key={funnel.steps.length} />
        </div>
      </div>
    </div>
  )
}
