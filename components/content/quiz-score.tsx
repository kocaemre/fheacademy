"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

interface QuizContextValue {
  registerQuestion: (id: string) => void
  submitAnswer: (id: string, isCorrect: boolean) => void
  score: { total: number; correct: number; answered: number }
}

const QuizContext = createContext<QuizContextValue | null>(null)

export function useQuizContext() {
  return useContext(QuizContext)
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Set<string>>(new Set())
  const [answers, setAnswers] = useState<
    Map<string, boolean>
  >(new Map())

  const registerQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const submitAnswer = useCallback((id: string, isCorrect: boolean) => {
    setAnswers((prev) => {
      if (prev.has(id)) return prev
      const next = new Map(prev)
      next.set(id, isCorrect)
      return next
    })
  }, [])

  const score = {
    total: questions.size,
    correct: Array.from(answers.values()).filter(Boolean).length,
    answered: answers.size,
  }

  return (
    <QuizContext.Provider value={{ registerQuestion, submitAnswer, score }}>
      {children}
    </QuizContext.Provider>
  )
}

export function QuizScore() {
  const ctx = useQuizContext()
  if (!ctx) return null

  const { score } = ctx

  // Only show after all questions are answered
  if (score.total === 0 || score.answered < score.total) return null

  return (
    <div className="my-8 flex items-center justify-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium">
        <span className="text-text-secondary">Quiz Score:</span>
        <span
          className={
            score.correct === score.total ? "text-success" : "text-warning"
          }
        >
          {score.correct}/{score.total} correct
        </span>
      </div>
    </div>
  )
}
