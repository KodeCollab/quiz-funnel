'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SettingsPage() {
  const [googleSheetId, setGoogleSheetId] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSaveSettings = async () => {
    setSaving(true)
    // Save to localStorage as fallback
    localStorage.setItem('supabase_url', supabaseUrl)
    localStorage.setItem('supabase_anon_key', supabaseAnonKey)
    localStorage.setItem('google_sheet_id', googleSheetId)
    setSaving(false)
    setMessage('Settings saved successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-12">
        <Link href="/admin" className="text-orange-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-12">Settings</h1>

      {message && (
        <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}

      <div className="space-y-16">
        {/* Supabase Configuration */}
        <div className="bg-white rounded-lg shadow p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supabase Configuration
          </h2>
          <p className="text-gray-600 mb-10 text-base">
            Your database connection details. Required for the quiz platform to work.
          </p>

          <div className="space-y-12">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-base"
              />
              <p className="text-xs text-gray-500 mt-4">
                Found in your Supabase project settings → API
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-base"
              />
              <p className="text-xs text-gray-500 mt-4">
                Found in your Supabase project settings → API
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>ℹ️ How to update:</strong> Paste your Supabase credentials above and click "Save Settings" to update them. Changes are stored locally for development.
              </p>
            </div>
          </div>
        </div>

        {/* Google Sheets Integration */}
        <div className="bg-white rounded-lg shadow p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Google Sheets Integration
          </h2>
          <p className="text-gray-600 mb-10 text-base">
            Auto-append quiz submissions to a Google Sheet
          </p>

          <div className="space-y-12">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Google Sheet ID
              </label>
              <input
                type="text"
                value={googleSheetId}
                onChange={(e) => setGoogleSheetId(e.target.value)}
                placeholder="e.g., 1BxiMVs0XRA5nFMXU8qgymy..."
                className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-base"
              />
              <p className="text-xs text-gray-500 mt-4">
                Find this in your Google Sheet URL: docs.google.com/spreadsheets/d/
                <span className="font-mono font-bold">SHEET_ID</span>/edit
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-4 px-8 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white rounded-lg shadow p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks</h2>
          <p className="text-gray-600 mb-10 text-base">
            Send submissions to external services (Slack, Zapier, custom endpoints)
          </p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-base text-gray-600 leading-relaxed">
              🚀 Webhook feature coming soon. Set up webhooks per funnel in the funnel editor.
            </p>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg shadow p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Keys</h2>
          <p className="text-gray-600 mb-10 text-base">Manage API access tokens for third-party integrations</p>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-base text-gray-600 leading-relaxed">
              🚀 API key management coming soon.
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white rounded-lg shadow p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Default Theme</h2>
          <p className="text-gray-600 mb-10 text-base">
            Default colors and fonts for new funnels
          </p>

          <div className="space-y-12">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Primary Color
              </label>
              <input
                type="color"
                defaultValue="#FF9332"
                className="w-24 h-14 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Background Color
              </label>
              <input
                type="color"
                defaultValue="#FFFFFF"
                className="w-24 h-14 rounded cursor-pointer"
              />
            </div>

            <button className="w-full py-4 px-8 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors text-lg">
              Save Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
