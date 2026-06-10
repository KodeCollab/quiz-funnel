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
    <div className="flex flex-col items-center justify-center w-full max-w-2xl text-center my-4 md:my-6" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight" style={{ WebkitFontSmoothing: 'antialiased' }}>
        {question}
      </h1>

      <div className="my-8 md:my-12">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100">
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-green-600 select-none"
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

      {description && (
        <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
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
  )
}
