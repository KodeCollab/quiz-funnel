'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllFunnels, updateFunnel, deleteFunnel } from '@/lib/supabase/queries'
import { FunnelConfig, QuizStep } from '@/lib/quiz-engine/types'
import StepEditor from '@/components/StepEditor'
import QuizPreviewPanel from '@/components/QuizPreviewPanel'

export default function FunnelEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [funnel, setFunnel] = useState<FunnelConfig | null>(null)
  const [editingStep, setEditingStep] = useState<QuizStep | null>(null)
  const [previewingStep, setPreviewingStep] = useState<QuizStep | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const loadFunnel = async () => {
    const funnels = await getAllFunnels()
    const found = funnels.find((f) => f.id === params.id)
    setFunnel(found || null)
    setLoading(false)
  }

  useEffect(() => {
    if (params.id) {
      loadFunnel()
    }
  }, [params.id])

  const handleSaveStep = async (updatedStep: QuizStep) => {
    if (!funnel) return
    setSaving(true)

    const updatedFunnel = {
      ...funnel,
      steps: funnel.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
    }

    const success = await updateFunnel(funnel.id, updatedFunnel)
    if (success) {
      setFunnel(updatedFunnel)
    }
    setSaving(false)
    setEditingStep(null)
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!funnel || funnel.steps.length <= 1) return
    if (!confirm('Are you sure you want to delete this step?')) return

    setSaving(true)
    const updatedFunnel = {
      ...funnel,
      steps: funnel.steps.filter((s) => s.id !== stepId),
    }

    const success = await updateFunnel(funnel.id, updatedFunnel)
    if (success) {
      setFunnel(updatedFunnel)
    }
    setSaving(false)
  }

  const handleAddStep = async () => {
    if (!funnel) return
    setSaving(true)

    const newStepId = `step${Date.now()}`
    const newStep: QuizStep = {
      id: newStepId,
      type: 'single_select',
      question: 'New Question',
      answers: [
        { label: 'Option 1', value: 'option1', next: 'step2' },
        { label: 'Option 2', value: 'option2', next: 'step2' },
      ],
    }

    const updatedFunnel = {
      ...funnel,
      steps: [...funnel.steps, newStep],
    }

    const success = await updateFunnel(funnel.id, updatedFunnel)
    if (success) {
      setFunnel(updatedFunnel)
      setEditingStep(newStep)
    }
    setSaving(false)
  }

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return

    if (!funnel) return

    const newSteps = [...funnel.steps]
    const [draggedStep] = newSteps.splice(draggedIndex, 1)
    newSteps.splice(targetIdx, 0, draggedStep)

    setSaving(true)
    const updatedFunnel = { ...funnel, steps: newSteps }
    const success = await updateFunnel(funnel.id, updatedFunnel)
    if (success) {
      setFunnel(updatedFunnel)
    }
    setSaving(false)
    setDraggedIndex(null)
  }

  const handleDeleteFunnel = async () => {
    if (!funnel) return
    if (!confirm(`Are you sure you want to delete "${funnel.name}"? This cannot be undone.`)) return

    setSaving(true)
    const success = await deleteFunnel(funnel.id)
    if (success) {
      router.push('/admin')
    } else {
      setSaving(false)
      alert('Failed to delete funnel')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!funnel) {
    return (
      <div className="max-w-7xl mx-auto p-6">
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
    <div className="max-w-7xl mx-auto p-8">
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
        <Link
          href={`/quiz/${funnel.slug}`}
          target="_blank"
          className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 text-lg"
        >
          Open Quiz →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Steps Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Steps</h2>

            <div className="space-y-5">
              {funnel.steps.map((step, idx) => {
                const isBeingDragged = draggedIndex === idx
                const isDragOverTarget =
                  draggedIndex !== null &&
                  draggedIndex !== idx &&
                  ((draggedIndex < idx && idx <= draggedIndex + 1) ||
                    (draggedIndex > idx && idx >= draggedIndex - 1))

                return (
                  <div
                    key={step.id}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    onClick={() => setPreviewingStep(step)}
                    className={`p-6 border rounded-lg transition-all flex gap-4 duration-200 ${
                      isBeingDragged
                        ? 'opacity-70 border-orange-500 bg-orange-100 shadow-lg scale-105'
                        : isDragOverTarget
                          ? 'scale-95 opacity-50'
                          : 'border-gray-200 hover:border-orange-500 hover:bg-gray-50 cursor-pointer shadow'
                    }`}
                  >
                  {/* Hamburger drag handle */}
                  <div
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    className="flex items-center pt-1 cursor-grab active:cursor-grabbing hover:text-orange-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Step info */}
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-2">Step {idx + 1}</div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">
                      {step.question}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Type:{' '}
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {step.type}
                      </span>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingStep(step)
                      }}
                      disabled={saving}
                      className="text-orange-500 hover:underline font-bold text-lg disabled:opacity-50 whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteStep(step.id)
                      }}
                      disabled={saving || funnel.steps.length <= 1}
                      className="text-red-500 hover:underline font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
            </div>

            <button
              onClick={handleAddStep}
              disabled={saving}
              className="mt-8 w-full py-4 px-8 border-2 border-orange-500 text-orange-500 font-bold rounded-lg hover:bg-orange-50 transition-colors text-lg disabled:opacity-50"
            >
              + Add Step
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <QuizPreviewPanel
            funnel={funnel}
            previewingStep={previewingStep}
            onCloseStepPreview={() => setPreviewingStep(null)}
            onDelete={handleDeleteFunnel}
            onRestart={() => {
              setPreviewingStep(null)
            }}
          />
        </div>
      </div>

      {/* Step Editor Modal */}
      {editingStep && (
        <StepEditor
          step={editingStep}
          onSave={handleSaveStep}
          onClose={() => setEditingStep(null)}
        />
      )}

      {/* Delete Quiz Button - Bottom */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <button
          onClick={handleDeleteFunnel}
          disabled={saving}
          className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          Delete Quiz
        </button>
      </div>
    </div>
  )
}
