'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSubmissions, getAllFunnels } from '@/lib/supabase/queries'
import { Submission, FunnelConfig } from '@/lib/quiz-engine/types'

export default function SubmissionsPage() {
  const params = useParams()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [funnel, setFunnel] = useState<FunnelConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (params.id) {
        const [submissionsData, funnels] = await Promise.all([
          getSubmissions(params.id as string),
          getAllFunnels(),
        ])
        setSubmissions(submissionsData)
        const found = funnels.find((f) => f.id === params.id)
        setFunnel(found || null)
      }
      setLoading(false)
    }
    loadData()
  }, [params.id])

  const getStepLabel = (stepId: string): string => {
    if (!funnel) return stepId
    const step = funnel.steps.find((s) => s.id === stepId)
    return step?.question || stepId
  }

  const formatAnswersForDisplay = (
    answers: Record<string, unknown>
  ): Record<string, unknown> => {
    const formatted: Record<string, unknown> = {}
    const labelCounts: Record<string, number> = {}

    // First pass: count label occurrences
    for (const [stepId] of Object.entries(answers)) {
      const label = getStepLabel(stepId)
      labelCounts[label] = (labelCounts[label] || 0) + 1
    }

    // Second pass: format with unique keys
    for (const [stepId, value] of Object.entries(answers)) {
      const label = getStepLabel(stepId)
      // If label appears multiple times, append step index
      if (labelCounts[label] > 1) {
        const stepIndex = funnel?.steps.findIndex((s) => s.id === stepId) || 0
        formatted[`${label} (Step ${stepIndex + 1})`] = value
      } else {
        formatted[label] = value
      }
    }
    return formatted
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-gray-500">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-12">
        <Link
          href={`/admin/funnels/${params.id}`}
          className="text-orange-500 hover:underline font-bold"
        >
          ← Back to Funnel
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Submissions</h1>

      {submissions.length === 0 ? (
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
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Submitted At
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Steps Completed
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Answers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {submission.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {submission.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {submission.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                      {Object.keys(submission.answers).length}/{funnel?.steps.filter(s => s.type !== 'results_page').length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <details className="cursor-pointer">
                        <summary className="text-orange-500 font-bold hover:text-orange-600">
                          View
                        </summary>
                        <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono whitespace-pre-wrap break-words max-w-sm">
                          {JSON.stringify(formatAnswersForDisplay(submission.answers), null, 2)}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total submissions: <span className="font-bold">{submissions.length}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
