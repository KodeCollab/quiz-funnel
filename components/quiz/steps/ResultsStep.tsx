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
  ctaText,
  ctaLink = '/',
}: ResultsStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 md:p-6 antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="w-full max-w-xl text-center">
        <div className="mb-6 md:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100 mb-4 md:mb-8">
            <svg
              className="w-10 h-10 md:w-12 md:h-12 text-green-600 select-none"
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

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          {question}
        </h1>

        {description && (
          <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-12 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
        )}

        {ctaText && (
          <Link
            href={ctaLink}
            className="btn-orange inline-block"
            style={{ WebkitFontSmoothing: 'antialiased' }}
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )
}
