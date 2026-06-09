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
  // First, check if this is a single select step with answer-level branching
  // (skip this for multiple_select since the answer is comma-separated)
  if (step.type === 'single_select' && step.answers) {
    const selectedAnswer = step.answers.find((a) => a.value === answer)
    if (selectedAnswer && selectedAnswer.next) {
      // Validate that the next step exists
      if (allSteps && allSteps.find((s) => s.id === selectedAnswer.next)) {
        console.log(`[resolveNextStep] Answer-level next: ${selectedAnswer.next}`)
        return selectedAnswer.next
      } else if (selectedAnswer.next) {
        // Next step doesn't exist, warn and fall through to auto-flow
        console.warn(`[resolveNextStep] Answer-level next step "${selectedAnswer.next}" not found, auto-flowing`)
      }
    }
  }

  // Otherwise, check step-level next field
  if (!step.next) {
    // Auto-flow to next step in sequence
    if (allSteps) {
      const currentIndex = allSteps.findIndex((s) => s.id === step.id)
      if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
        const nextStep = allSteps[currentIndex + 1]
        console.log(`[resolveNextStep] Auto-flow from ${step.id} to ${nextStep.id}`)
        return nextStep.id
      }
      // End of quiz - look for results page or return last step
      const resultsStep = allSteps.find((s) => s.type === 'results_page')
      if (resultsStep) {
        console.log(`[resolveNextStep] End of quiz, returning results page: ${resultsStep.id}`)
        return resultsStep.id
      }
      // No results page, return last step ID as fallback
      const lastStep = allSteps[allSteps.length - 1]
      console.log(`[resolveNextStep] No results page found, staying on last step: ${lastStep.id}`)
      return lastStep.id
    }
    console.log(`[resolveNextStep] No allSteps provided, cannot auto-flow`)
    return step.id
  }

  if (typeof step.next === 'string') {
    // Validate that the next step exists
    if (allSteps && allSteps.find((s) => s.id === step.next)) {
      console.log(`[resolveNextStep] Direct next: ${step.next}`)
      return step.next
    } else {
      // Next step doesn't exist, auto-flow instead
      console.warn(`[resolveNextStep] Next step "${step.next}" not found, auto-flowing`)
      if (allSteps) {
        const currentIndex = allSteps.findIndex((s) => s.id === step.id)
        if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
          const nextStep = allSteps[currentIndex + 1]
          console.log(`[resolveNextStep] Auto-flow from ${step.id} to ${nextStep.id}`)
          return nextStep.id
        }
        const lastStep = allSteps[allSteps.length - 1]
        return lastStep.id
      }
      return step.id
    }
  }

  // Conditional branching
  for (const branch of step.next) {
    if (evaluateCondition(branch.condition, answer, allAnswers)) {
      console.log(`[resolveNextStep] Conditional branch matched: ${branch.next}`)
      return branch.next
    }
  }

  // Fallback - return last step in allSteps if available
  if (allSteps && allSteps.length > 0) {
    const lastStep = allSteps[allSteps.length - 1]
    console.log(`[resolveNextStep] No condition matched, returning last step: ${lastStep.id}`)
    return lastStep.id
  }

  console.log(`[resolveNextStep] No valid next step found, staying on current step: ${step.id}`)
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
