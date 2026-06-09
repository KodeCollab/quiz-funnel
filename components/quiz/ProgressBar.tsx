'use client'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div
      className="w-full h-2 bg-gray-300 flex overflow-hidden"
      style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}
    >
      {/* Filled sections */}
      {Array.from({ length: current }).map((_, i) => (
        <div
          key={`filled-${i}`}
          className="flex-1 bg-orange-500"
          style={{ transition: 'all 300ms ease-out' }}
        />
      ))}

      {/* Empty sections */}
      {Array.from({ length: Math.max(0, total - current) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="flex-1 bg-gray-300"
        />
      ))}
    </div>
  )
}
