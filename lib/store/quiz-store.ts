import { create } from 'zustand'
import { QuizStoreState } from '../quiz-engine/types'
import { v4 as uuidv4 } from 'uuid'

export const useQuizStore = create<QuizStoreState>((set) => ({
  funnelId: '',
  currentStepId: '',
  answers: {},
  history: [],
  sessionId: uuidv4(),

  setFunnelId: (id: string) =>
    set(() => ({
      funnelId: id,
    })),

  setCurrentStep: (stepId: string) =>
    set((state) => ({
      currentStepId: stepId,
      history: [...state.history, stepId],
    })),

  setAnswer: (stepId: string, value: unknown) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [stepId]: value,
      },
    })),

  goNext: (nextStepId: string) =>
    set((state) => ({
      currentStepId: nextStepId,
      history: [...state.history, nextStepId],
    })),

  goBack: () =>
    set((state) => {
      if (state.history.length <= 1) return state
      const newHistory = state.history.slice(0, -1)
      return {
        currentStepId: newHistory[newHistory.length - 1],
        history: newHistory,
      }
    }),

  reset: () =>
    set(() => ({
      currentStepId: '',
      answers: {},
      history: [],
      sessionId: uuidv4(),
    })),
}))
