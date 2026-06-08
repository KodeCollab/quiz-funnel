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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-2xl text-center">
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

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>

        {description && (
          <p className="text-xl text-gray-600 mb-12 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        <Link
          href={ctaLink}
          className="inline-block px-8 py-4 bg-orange-500 text-white font-semibold text-lg rounded-xl hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg border-transparent"
          style={{ WebkitFontSmoothing: 'antialiased' }}
        >
          {ctaText}
        </Link>
      </div>
    </div>
  )
}
