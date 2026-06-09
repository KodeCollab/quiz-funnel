'use client'

import { useEffect } from 'react'

interface LoadingStepProps {
  question: string
  onComplete: () => void
  duration?: number
}

export function LoadingStep({
  question,
  onComplete,
  duration = 2000,
}: LoadingStepProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration)
    return () => clearTimeout(timer)
  }, [onComplete, duration])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 md:p-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 md:mb-16 leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>

        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" style={{ borderColor: 'transparent' }} />
        </div>
      </div>
    </div>
  )
}
