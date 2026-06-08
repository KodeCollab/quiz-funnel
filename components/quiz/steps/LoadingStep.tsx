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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
          {question}
        </h1>

        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
