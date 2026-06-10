'use client'

import { useState, useEffect } from 'react'
import { QuizStep } from '@/lib/quiz-engine/types'

interface StepEditorProps {
  step: QuizStep
  onSave: (step: QuizStep) => void
  onClose: () => void
  allSteps?: QuizStep[]
}

const stepTypeLabels: Record<string, string> = {
  email_capture: 'Email',
  name_capture: 'Name',
  phone_capture: 'Phone',
  address_capture: 'Address',
  zipcode_capture: 'Postal Code',
  city_capture: 'City',
  housenumber_capture: 'House Number',
  country_capture: 'Country',
  text_input: 'Text Input',
  single_select: 'Single Select',
  multiple_select: 'Multiple Select',
  loading_screen: 'Loading Screen',
  results_page: 'Results Page',
  cta: 'Call To Action',
}

export default function StepEditor({ step, onSave, onClose, allSteps = [] }: StepEditorProps) {
  const [formData, setFormData] = useState(() => {
    // Auto-populate question on load if it's "New Question"
    if (step.question === 'New Question' && stepTypeLabels[step.type]) {
      return { ...step, question: stepTypeLabels[step.type] }
    }
    return step
  })

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
    const updatedAnswer = { ...newAnswers[idx], [field]: value }

    // Auto-generate value from label
    if (field === 'label') {
      updatedAnswer.value = value.toLowerCase().replace(/\s+/g, '-')
    }

    newAnswers[idx] = updatedAnswer
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
            <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
              Step Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as any
                const newQuestion = stepTypeLabels[newType] || 'Question'
                setFormData({ ...formData, type: newType, question: newQuestion })
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="single_select">Single Select</option>
              <option value="multiple_select">Multiple Select</option>
              <option value="email_capture">Email</option>
              <option value="name_capture">Name</option>
              <option value="phone_capture">Phone</option>
              <option value="address_capture">Address</option>
              <option value="zipcode_capture">Postal Code</option>
              <option value="city_capture">City</option>
              <option value="housenumber_capture">House Number</option>
              <option value="country_capture">Country</option>
              <option value="text_input">Text Input</option>
              <option value="cta">Call To Action</option>
              <option value="loading_screen">Loading Screen</option>
              <option value="results_page">Results Page</option>
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
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
            <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
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

          {/* Next Step (required) */}
          {formData.type !== 'results_page' && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                Next Step
              </label>
              <select
                value={(formData as any).next || ''}
                onChange={(e) =>
                  setFormData({ ...formData, next: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              >
                <option value="" disabled>Select next step...</option>
                {allSteps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.type === 'results_page' ? '✓ Results Page' : s.question}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Answers (for select types) */}
          {['single_select', 'multiple_select'].includes(formData.type) && (
            <div>
              <div className="flex justify-between items-center mt-3 mb-4">
                <label className="block text-sm font-bold text-gray-900">
                  Answers
                </label>
                <button
                  onClick={handleAddAnswer}
                  className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 mt-3 mb-3"
                >
                  + Add Answer
                </button>
              </div>
              <div className="space-y-4">
                {(formData as any).answers?.map(
                  (answer: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3"
                    >
                      <div className="flex gap-2 mt-3 mb-3">
                        <input
                          type="text"
                          value={answer.label}
                          onChange={(e) =>
                            handleUpdateAnswer(idx, 'label', e.target.value)
                          }
                          placeholder="Answer text"
                          className="flex-1 px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={() => handleRemoveAnswer(idx)}
                          disabled={(formData as any).answers?.length <= 1}
                          className="px-4 py-3 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Button (for results page) */}
          {formData.type === 'results_page' && (
            <div className="space-y-6 px-4 py-8">
              <h3 className="font-bold text-gray-900">Button (Optional)</h3>
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Button Text
                </label>
                <input
                  type="text"
                  value={(formData as any).ctaText || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  placeholder="Leave empty to hide button"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Button Link
                </label>
                <input
                  type="text"
                  value={(formData as any).ctaLink || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaLink: e.target.value })
                  }
                  placeholder="e.g., https://example.com or /page"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Duration (for loading screen) */}
          {formData.type === 'loading_screen' && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                Loading Duration (milliseconds)
              </label>
              <input
                type="number"
                value={(formData as any).duration || 2000}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) || 2000 })
                }
                min="500"
                step="100"
                placeholder="2000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-2">Default: 2000ms (2 seconds)</p>
            </div>
          )}

          {/* CTA Step Configuration */}
          {formData.type === 'cta' && (
            <div className="space-y-6">
              {/* Selected Fields */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Input Fields
                </label>
                <div className="space-y-2">
                  {(['name', 'email', 'phone'] as const).map((field) => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={((formData as any).selectedFields || []).includes(field)}
                        onChange={(e) => {
                          const selectedFields = [...((formData as any).selectedFields || [])]
                          if (e.target.checked) {
                            selectedFields.push(field)
                          } else {
                            selectedFields.splice(selectedFields.indexOf(field), 1)
                          }
                          setFormData({ ...formData, selectedFields })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 capitalize">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkbox Text */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Checkbox Text
                </label>
                <textarea
                  value={(formData as any).checkboxText || 'I have read and agree to the {termsOfUse} and {privacyPolicy}'}
                  onChange={(e) =>
                    setFormData({ ...formData, checkboxText: e.target.value })
                  }
                  placeholder="Use {termsOfUse} and {privacyPolicy} as variable placeholders"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-2">Use {'{termsOfUse}'} and {'{privacyPolicy}'} as placeholders for links</p>
              </div>

              {/* Terms of Use URL */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Terms of Use URL
                </label>
                <input
                  type="text"
                  value={(formData as any).termsOfUseUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, termsOfUseUrl: e.target.value })
                  }
                  placeholder="https://example.com/terms"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Privacy Policy URL */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Privacy Policy URL
                </label>
                <input
                  type="text"
                  value={(formData as any).privacyPolicyUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, privacyPolicyUrl: e.target.value })
                  }
                  placeholder="https://example.com/privacy"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* CTA Button Text */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Button Text
                </label>
                <input
                  type="text"
                  value={(formData as any).ctaText || 'Continue'}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  placeholder="Button text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* CTA Button Link */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Button Link (optional)
                </label>
                <input
                  type="text"
                  value={(formData as any).ctaLink || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaLink: e.target.value })
                  }
                  placeholder="Leave empty to submit form, or enter URL"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-2">If left empty, form will be submitted. Otherwise, link will open in new tab.</p>
              </div>

              {/* Warning Text */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mt-3 mb-3">
                  Warning Text (when checkbox not checked)
                </label>
                <input
                  type="text"
                  value={(formData as any).warningText || 'To continue, accept the T&C'}
                  onChange={(e) =>
                    setFormData({ ...formData, warningText: e.target.value })
                  }
                  placeholder="To continue, accept the T&C"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
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
