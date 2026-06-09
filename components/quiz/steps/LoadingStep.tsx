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
    <div className="flex flex-col items-center justify-center w-full h-full px-4 md:px-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>

        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" style={{ borderColor: 'transparent' }} />
        </div>
      </div>
    </div>
  )
}
