'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllFunnels } from '@/lib/supabase/queries'
import { FunnelConfig } from '@/lib/quiz-engine/types'

export default function AdminDashboard() {
  const [funnels, setFunnels] = useState<FunnelConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFunnels()
  }, [])

  const loadFunnels = async () => {
    const data = await getAllFunnels()
    setFunnels(data)
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Quiz Funnels</h1>
        <Link
          href="/admin/funnels/new"
          className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 text-lg"
        >
          + New Funnel
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-20">Loading...</div>
      ) : funnels.length === 0 ? (
        <div className="text-center text-gray-600 py-24">
          <p className="mb-8 text-xl">No funnels yet</p>
          <Link
            href="/admin/funnels/new"
            className="text-orange-500 font-bold hover:underline"
          >
            Create your first funnel
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-bold text-gray-900">
                  Name
                </th>
                <th className="text-left px-6 py-4 font-bold text-gray-900">
                  Slug
                </th>
                <th className="text-left px-6 py-4 font-bold text-gray-900">
                  Status
                </th>
                <th className="text-left px-6 py-4 font-bold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {funnels.map((funnel) => (
                <tr key={funnel.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-5 text-gray-900">{funnel.name}</td>
                  <td className="px-6 py-5 text-gray-600">/{funnel.slug}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        funnel.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {funnel.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-5 space-x-8">
                    <Link
                      href={`/admin/funnels/${funnel.id}`}
                      className="text-orange-500 font-bold hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/funnels/${funnel.id}/submissions`}
                      className="text-blue-500 font-bold hover:underline"
                    >
                      Submissions
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
