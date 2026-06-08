import { z } from 'zod'

export type StepType =
  | 'address_lookup'
  | 'multiple_choice'
  | 'image_select'
  | 'single_select'
  | 'multi_select'
  | 'text_input'
  | 'textarea'
  | 'email_capture'
  | 'phone_capture'
  | 'name_capture'
  | 'slider'
  | 'loading_screen'
  | 'results_page'

export interface Answer {
  label: string
  value: string
  image?: string
  next?: string
}

export interface Condition {
  field: string
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
  value: string | number
}

export interface ConditionalNext {
  condition: Condition
  next: string
}

export interface QuizStep {
  id: string
  type: StepType
  question: string
  description?: string
  required?: boolean
  answers?: Answer[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
  next?: string | ConditionalNext[]
}

export interface FunnelTheme {
  primaryColor: string
  backgroundColor: string
  fontFamily: string
  logoUrl?: string
  buttonStyle: 'rounded' | 'pill' | 'square'
}

export interface FunnelConfig {
  id: string
  slug: string
  name: string
  startStepId: string
  steps: QuizStep[]
  theme: FunnelTheme
  googleSheetsId?: string
  webhookUrl?: string
  scoring?: ScoringRule[]
  active: boolean
}

export interface ScoringRule {
  stepId: string
  value: string | number
  points: number
}

export interface Submission {
  id: string
  funnelId: string
  sessionId: string
  answers: Record<string, unknown>
  leadScore: number
  email?: string
  phone?: string
  name?: string
  address?: {
    street?: string
    city?: string
    zipCode?: string
    country?: string
  }
  completed: boolean
  submittedAt: string
}

export interface QuizStoreState {
  funnelId: string
  currentStepId: string
  answers: Record<string, unknown>
  history: string[]
  sessionId: string
  setFunnelId: (id: string) => void
  setCurrentStep: (stepId: string) => void
  setAnswer: (stepId: string, value: unknown) => void
  goNext: (nextStepId: string) => void
  goBack: () => void
  reset: () => void
}
