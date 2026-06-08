'use client'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="w-full bg-white antialiased" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <div className="px-4 py-6 text-center">
        <p className="text-sm font-semibold text-blue-500 tracking-wide select-none" style={{ WebkitFontSmoothing: 'antialiased' }}>
          Question {current} of {total}
        </p>
      </div>
      <div className="px-4 pb-4">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
