'use client'

import { useState } from 'react'
import { QuizStep } from '@/lib/quiz-engine/types'

interface StepEditorProps {
  step: QuizStep
  onSave: (step: QuizStep) => void
  onClose: () => void
}

export default function StepEditor({ step, onSave, onClose }: StepEditorProps) {
  const [formData, setFormData] = useState(step)

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const handleAddAnswer = () => {
    const newAnswers = [...((formData as any).answers || [])]
    newAnswers.push({ label: '', value: '', next: '' })
    setFormData({ ...formData, answers: newAnswers } as any)
  }

  const handleRemoveAnswer = (idx: number) => {
    const newAnswers = [...((formData as any).answers || [])]
    newAnswers.splice(idx, 1)
    setFormData({ ...formData, answers: newAnswers } as any)
  }

  const handleUpdateAnswer = (idx: number, field: string, value: string) => {
    const newAnswers = [...((formData as any).answers || [])]
    newAnswers[idx] = { ...newAnswers[idx], [field]: value }
    setFormData({ ...formData, answers: newAnswers } as any)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Step</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Step Type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Step Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="single_select">Single Select</option>
              <option value="multiple_select">Multiple Select</option>
              <option value="email_capture">Email</option>
              <option value="name_capture">Name</option>
              <option value="phone_capture">Phone</option>
              <option value="text_input">Text Input</option>
              <option value="loading_screen">Loading Screen</option>
              <option value="results_page">Results Page</option>
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Question / Label
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="What is your question?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Description (optional)
            </label>
            <textarea
              value={(formData as any).description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional hint or description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Answers (for select types) */}
          {['single_select', 'multiple_select'].includes(formData.type) && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-gray-900">
                  Answers
                </label>
                <button
                  onClick={handleAddAnswer}
                  className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  + Add Answer
                </button>
              </div>
              <div className="space-y-4">
                {(formData as any).answers?.map(
                  (answer: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 rounded-lg space-y-3"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={answer.label}
                          onChange={(e) =>
                            handleUpdateAnswer(idx, 'label', e.target.value)
                          }
                          placeholder="Answer text"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
                        />
                        <button
                          onClick={() => handleRemoveAnswer(idx)}
                          disabled={(formData as any).answers?.length <= 1}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={answer.value}
                        onChange={(e) =>
                          handleUpdateAnswer(idx, 'value', e.target.value)
                        }
                        placeholder="Value (e.g., yes, no)"
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-6 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
          >
            Save Step
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
