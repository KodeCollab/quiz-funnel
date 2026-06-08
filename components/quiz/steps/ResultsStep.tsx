'use client'

import Link from 'next/link'

interface ResultsStepProps {
  question: string
  description?: string
  ctaText?: string
  ctaLink?: string
}

export function ResultsStep({
  question,
  description,
  ctaText = 'Back to Home',
  ctaLink = '/',
}: ResultsStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
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
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {question}
        </h1>

        {description && (
          <p className="text-xl text-gray-600 mb-8">{description}</p>
        )}

        <Link
          href={ctaLink}
          className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  )
}
