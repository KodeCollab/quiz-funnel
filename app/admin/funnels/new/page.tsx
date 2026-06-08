'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createFunnel } from '@/lib/supabase/queries'
import { FunnelConfig } from '@/lib/quiz-engine/types'

export default function NewFunnelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name.trim()) {
      setError('Funnel name is required')
      setLoading(false)
      return
    }

    if (!formData.slug.trim()) {
      setError('Slug is required')
      setLoading(false)
      return
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      setLoading(false)
      return
    }

    try {
      const config: FunnelConfig = {
        id: '', // Will be set by Supabase
        slug: formData.slug,
        name: formData.name,
        startStepId: 'step1',
        steps: [
          {
            id: 'step1',
            type: 'single_select',
            question: 'Question 1?',
            answers: [
              { label: 'Option 1', value: 'option1', next: 'results' },
              { label: 'Option 2', value: 'option2', next: 'results' },
            ],
            next: 'results',
          },
          {
            id: 'results',
            type: 'results_page',
            question: 'Thank you!',
          },
        ],
        theme: {
          primaryColor: '#FF9332',
          backgroundColor: '#FFFFFF',
          fontFamily: 'sans-serif',
          buttonStyle: 'rounded',
        },
        active: true,
      }

      const funnelId = await createFunnel(config)

      if (funnelId) {
        router.push(`/admin/funnels/${funnelId}`)
      } else {
        setError(
          'Failed to create funnel. Supabase may not be configured. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
        )
      }
    } catch (err) {
      console.error('Error creating funnel:', err)
      setError(
        'Error: Supabase connection failed. Please verify your environment variables and Supabase database is set up. See SETUP.md for instructions.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-12">
        <Link href="/admin" className="text-orange-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-12">Create New Funnel</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-10 space-y-12">
        {error && (
          <div className="p-6 bg-red-100 text-red-800 rounded-lg text-base">{error}</div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Funnel Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Solar Savings Quiz"
            className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-base"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-4">
            This is the internal name for your funnel
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">
            URL Slug
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium">/quiz/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                })
              }
              placeholder="e.g., solar"
              className="flex-1 px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-base"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Used in the public quiz URL (lowercase, hyphens only)
          </p>
        </div>

        <div className="flex gap-6 pt-10">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-8 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? 'Creating...' : 'Create Funnel'}
          </button>
          <Link
            href="/admin"
            className="flex-1 py-4 px-8 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors text-center text-lg"
          >
            Cancel
          </Link>
        </div>
      </form>

      <div className="mt-12 p-8 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-5 text-lg">What happens next?</h3>
        <ul className="text-base text-blue-800 space-y-3">
          <li>✓ Your funnel is created with a sample question</li>
          <li>✓ You can edit steps in the editor</li>
          <li>✓ Publish when ready</li>
          <li>✓ Share the link at /quiz/[your-slug]</li>
        </ul>
      </div>
    </div>
  )
}
