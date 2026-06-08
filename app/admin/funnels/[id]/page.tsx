'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getAllFunnels } from '@/lib/supabase/queries'
import { FunnelConfig } from '@/lib/quiz-engine/types'

export default function FunnelEditorPage() {
  const params = useParams()
  const [funnel, setFunnel] = useState<FunnelConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFunnel = async () => {
      const funnels = await getAllFunnels()
      const found = funnels.find((f) => f.id === params.id)
      setFunnel(found || null)
      setLoading(false)
    }

    if (params.id) {
      loadFunnel()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!funnel) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Funnel Not Found
          </h1>
          <Link
            href="/admin"
            className="text-orange-500 font-bold hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-12">
        <Link href="/admin" className="text-orange-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{funnel.name}</h1>
          <p className="text-gray-600 mt-3 text-lg">/quiz/{funnel.slug}</p>
        </div>
        <div className="flex gap-5">
          <Link
            href={`/quiz/${funnel.slug}`}
            target="_blank"
            className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 text-lg"
          >
            Preview Quiz →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Steps Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Steps</h2>

            <div className="space-y-5">
              {funnel.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-6 border border-gray-200 rounded-lg hover:border-orange-500 transition-colors hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">Step {idx + 1}</div>
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">{step.question}</h3>
                      <p className="text-sm text-gray-600">
                        Type: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{step.type}</span>
                      </p>
                    </div>
                    <button className="text-orange-500 hover:underline font-bold text-lg">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-4 px-8 border-2 border-orange-500 text-orange-500 font-bold rounded-lg hover:bg-orange-50 transition-colors text-lg">
              + Add Step
            </button>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Theme</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={funnel.theme?.primaryColor || '#FF9332'}
                  className="w-full h-14 rounded cursor-pointer"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Background Color
                </label>
                <input
                  type="color"
                  value={funnel.theme?.backgroundColor || '#FFFFFF'}
                  className="w-full h-14 rounded cursor-pointer"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Status</h3>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-bold text-green-700 text-lg">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Quick Links</h3>
            <div className="space-y-4">
              <Link
                href={`/admin/funnels/${funnel.id}/submissions`}
                className="block p-5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-900 transition-colors text-center text-lg"
              >
                📊 View Submissions
              </Link>
              <button className="w-full p-5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-900 transition-colors text-lg">
                ⚙️ Integrations
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-bold text-yellow-900 mb-4 text-lg">⚠️ Edit Feature Coming Soon</h3>
        <p className="text-base text-yellow-800 mb-4">
          Full step editor is coming next. For now, you can:
        </p>
        <ul className="text-base text-yellow-800 ml-6 space-y-3">
          <li>✓ Preview the quiz by clicking "Preview Quiz"</li>
          <li>✓ View submissions in the submissions tab</li>
          <li>✓ Edit steps directly in the database (advanced)</li>
        </ul>
      </div>
    </div>
  )
}
