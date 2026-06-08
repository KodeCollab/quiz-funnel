import { QuizStep, Condition } from './types'

export function evaluateCondition(
  condition: Condition,
  currentAnswer: unknown,
  allAnswers: Record<string, unknown>
): boolean {
  const value = allAnswers[condition.field] ?? currentAnswer

  switch (condition.operator) {
    case 'eq':
      return value === condition.value
    case 'gt':
      return Number(value) > Number(condition.value)
    case 'gte':
      return Number(value) >= Number(condition.value)
    case 'lt':
      return Number(value) < Number(condition.value)
    case 'lte':
      return Number(value) <= Number(condition.value)
    case 'contains':
      return String(value).includes(String(condition.value))
    default:
      return false
  }
}

export function resolveNextStep(
  step: QuizStep,
  answer: unknown,
  allAnswers: Record<string, unknown>,
  allSteps?: QuizStep[]
): string {
  if (!step.next) {
    // Auto-flow to next step in sequence
    if (allSteps) {
      const currentIndex = allSteps.findIndex((s) => s.id === step.id)
      if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
        return allSteps[currentIndex + 1].id
      }
    }
    return 'results'
  }

  if (typeof step.next === 'string') {
    return step.next
  }

  // Conditional branching
  for (const branch of step.next) {
    if (evaluateCondition(branch.condition, answer, allAnswers)) {
      return branch.next
    }
  }

  // Fallback
  return 'results'
}

export function calculateLeadScore(
  answers: Record<string, unknown>,
  scoringRules: Array<{ stepId: string; value: string | number; points: number }> = []
): number {
  return scoringRules.reduce((score, rule) => {
    if (answers[rule.stepId] === rule.value) {
      return score + rule.points
    }
    return score
  }, 0)
}
