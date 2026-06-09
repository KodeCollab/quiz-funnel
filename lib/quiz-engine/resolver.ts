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
  // All steps must have explicit routing via step.next
  // No auto-flow or answer-level branching

  if (!step.next) {
    console.error(`[resolveNextStep] Step "${step.id}" has no next step configured`)
    return step.id
  }

  if (typeof step.next === 'string') {
    // Direct next step
    console.log(`[resolveNextStep] Direct next: ${step.next}`)
    return step.next
  }

  // Conditional branching
  if (Array.isArray(step.next)) {
    for (const branch of step.next) {
      if (evaluateCondition(branch.condition, answer, allAnswers)) {
        console.log(`[resolveNextStep] Conditional branch matched: ${branch.next}`)
        return branch.next
      }
    }
    console.error(`[resolveNextStep] No condition matched for step "${step.id}"`)
    return step.id
  }

  console.error(`[resolveNextStep] Invalid next configuration for step "${step.id}"`)
  return step.id
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
