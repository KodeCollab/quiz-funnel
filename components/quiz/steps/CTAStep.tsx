'use client'

import { useState, ReactNode } from 'react'

interface CTAStepProps {
  question: string
  description?: string
  selectedFields: ('name' | 'email' | 'phone')[]
  checkboxText?: string
  termsOfUseUrl?: string
  privacyPolicyUrl?: string
  ctaText?: string
  ctaLink?: string
  warningText?: string
  values?: Record<string, string>
  onSubmit: (data: Record<string, string>) => void
}

export function CTAStep({
  question,
  description,
  selectedFields,
  checkboxText = 'I have read and agree to the terms and privacy policy',
  termsOfUseUrl = '#',
  privacyPolicyUrl = '#',
  ctaText = 'Continue',
  ctaLink,
  warningText = 'To continue, accept the T&C',
  values = {},
  onSubmit,
}: CTAStepProps) {
  const [formData, setFormData] = useState<Record<string, string>>(values)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (selectedFields.includes('name') && !formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }
    if (selectedFields.includes('email')) {
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
    }
    if (selectedFields.includes('phone')) {
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone is required'
      } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }
    if (!agreed) {
      newErrors.checkbox = warningText
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleCTAClick = () => {
    if (ctaLink) {
      if (ctaLink.startsWith('http')) {
        window.open(ctaLink, '_blank')
      } else {
        window.location.href = ctaLink
      }
    } else {
      if (!agreed) {
        setErrors({ checkbox: warningText })
        return
      }
      handleSubmit()
    }
  }

  const renderCheckboxText = () => {
    let text = checkboxText
    const parts: (string | ReactNode)[] = []
    let lastIndex = 0

    const termsRegex = /\{termsOfUse\}/g
    const privacyRegex = /\{privacyPolicy\}/g

    let match
    const tokens: Array<{ type: 'text' | 'terms' | 'privacy'; start: number; end: number }> = []

    while ((match = termsRegex.exec(text)) !== null) {
      tokens.push({ type: 'terms', start: match.index, end: termsRegex.lastIndex })
    }

    while ((match = privacyRegex.exec(text)) !== null) {
      tokens.push({ type: 'privacy', start: match.index, end: privacyRegex.lastIndex })
    }

    tokens.sort((a, b) => a.start - b.start)

    let currentIndex = 0
    for (const token of tokens) {
      if (currentIndex < token.start) {
        parts.push(text.slice(currentIndex, token.start))
      }

      if (token.type === 'terms') {
        parts.push(
          <a
            key={`terms-${token.start}`}
            href={termsOfUseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline cursor-pointer"
          >
            Terms of Use
          </a>
        )
      } else if (token.type === 'privacy') {
        parts.push(
          <a
            key={`privacy-${token.start}`}
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline cursor-pointer"
          >
            Privacy Policy
          </a>
        )
      }

      currentIndex = token.end
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl" style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center leading-tight" style={{ WebkitFontSmoothing: 'antialiased' }}>
        {question}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed" style={{ WebkitFontSmoothing: 'antialiased' }}>{description}</p>
      )}

      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm">
        {selectedFields.includes('name') && (
          <div className="input-container-block">
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              placeholder="Full name"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
            {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
          </div>
        )}

        {selectedFields.includes('email') && (
          <div className="input-container-block">
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              placeholder="your@email.com"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
          </div>
        )}

        {selectedFields.includes('phone') && (
          <div className="input-container-block">
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (errors.phone) setErrors({ ...errors, phone: '' })
              }}
              placeholder="+44 123 456 7890"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
          </div>
        )}

        <div className="w-full my-6 p-6">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked)
                if (errors.checkbox) setErrors({ ...errors, checkbox: '' })
              }}
              className="mt-1 cursor-pointer flex-shrink-0 w-5 h-5"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            />
            <label htmlFor="terms-checkbox" className="text-sm text-gray-700 cursor-pointer leading-relaxed flex-1" style={{ WebkitFontSmoothing: 'antialiased' }}>
              {renderCheckboxText()}
            </label>
          </div>
          {errors.checkbox && <p className="text-red-500 text-sm mt-4">{errors.checkbox}</p>}
        </div>

        <button
          onClick={handleCTAClick}
          disabled={false}
          className="btn-orange-block"
          style={{ WebkitFontSmoothing: 'antialiased' }}
        >
          {ctaText}
        </button>
      </div>
    </div>
  )
}
