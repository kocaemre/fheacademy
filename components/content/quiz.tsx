"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useQuizContext } from "@/components/content/quiz-score"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuizProps {
  question: QuizQuestion
}

function getStorageKey(questionId: string) {
  return `quiz-answer-${questionId}`
}

export function Quiz({ question }: QuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const quizCtx = useQuizContext()

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(question.id))
    if (saved !== null) {
      const idx = parseInt(saved, 10)
      setSelectedIndex(idx)
      setIsSubmitted(true)
      quizCtx?.submitAnswer(question.id, idx === question.correctIndex)
    }
  }, [question.id, question.correctIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    quizCtx?.registerQuestion(question.id)
  }, [question.id, quizCtx])

  const isCorrect = selectedIndex === question.correctIndex

  const handleCheck = () => {
    if (selectedIndex === null) return
    setIsSubmitted(true)
    localStorage.setItem(getStorageKey(question.id), String(selectedIndex))
    quizCtx?.submitAnswer(question.id, selectedIndex === question.correctIndex)
  }

  return (
    <div className="my-8 rounded-lg border border-border bg-surface p-6">
      <p className="mb-4 font-medium text-text-primary">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !isSubmitted && setSelectedIndex(i)}
            disabled={isSubmitted}
            className={cn(
              "w-full text-left px-4 py-3 rounded-md border transition-colors text-sm",
              isSubmitted &&
                i === question.correctIndex &&
                "border-success bg-success/10 text-text-primary",
              isSubmitted &&
                i === selectedIndex &&
                i !== question.correctIndex &&
                "border-error bg-error/10 text-text-primary",
              !isSubmitted &&
                i === selectedIndex &&
                "border-primary bg-primary/10 text-text-primary",
              !isSubmitted &&
                i !== selectedIndex &&
                "border-border hover:border-border-active text-text-secondary hover:text-text-primary",
              isSubmitted &&
                i !== question.correctIndex &&
                i !== selectedIndex &&
                "border-border text-text-muted opacity-60"
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {!isSubmitted && (
        <button
          onClick={handleCheck}
          disabled={selectedIndex === null}
          className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          Check
        </button>
      )}
      {isSubmitted && (
        <div
          className={cn(
            "mt-4 p-3 rounded-md text-sm",
            isCorrect ? "bg-success/10" : "bg-error/10"
          )}
        >
          <p
            className={cn(
              "font-medium",
              isCorrect ? "text-success" : "text-error"
            )}
          >
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="mt-1 text-text-secondary">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
