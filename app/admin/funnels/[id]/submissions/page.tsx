'use client'

import Link from 'next/link'

interface SubmissionsPageProps {
  params: {
    id: string
  }
}

export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-12">
        <Link
          href={`/admin/funnels/${params.id}`}
          className="text-orange-500 hover:underline"
        >
          ← Back to Funnel
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-12">Submissions</h1>

      <div className="bg-white rounded-lg shadow p-16 text-center">
        <div className="mb-8 text-7xl">📊</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          No submissions yet
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          Submissions will appear here after people complete your quiz.
        </p>
        <Link
          href={`/admin/funnels/${params.id}`}
          className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 text-lg"
        >
          Edit Funnel
        </Link>
      </div>

      <div className="mt-10 p-8 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-5 text-lg">Submissions Feature</h3>
        <p className="text-base text-blue-800 mb-5">
          Once you publish your quiz and users start responding, their submissions will appear in this table with:
        </p>
        <ul className="text-base text-blue-800 ml-6 space-y-3">
          <li>✓ Timestamp of submission</li>
          <li>✓ User name, email, phone</li>
          <li>✓ All answers provided</li>
          <li>✓ Lead score</li>
          <li>✓ Export to CSV button</li>
        </ul>
      </div>
    </div>
  )
}
