"use client"

import { useEffect, useState } from "react"
import { Bot, Check, Copy, Save } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export interface RubricCriterion {
  criterion: string
  weight: string
  exceeds: string
  meets: string
  below: string
}

interface AIGraderProps {
  homeworkTitle: string
  homeworkId: string
  rubricCriteria: RubricCriterion[]
}

function buildPrompt(
  title: string,
  criteria: RubricCriterion[],
  code: string
): string {
  const rubricLines = criteria
    .map(
      (c) =>
        `- **${c.criterion}** (${c.weight})\n  - Exceeds: ${c.exceeds}\n  - Meets: ${c.meets}\n  - Below: ${c.below}`
    )
    .join("\n")

  return `You are grading a student's FHEVM homework submission.

## Assignment: ${title}

## Grading Rubric
${rubricLines}

## Student's Code
\`\`\`solidity
${code}
\`\`\`

## Instructions
Grade the student's code against each rubric criterion. For each:
1. State PASS or FAIL
2. Explain what was done well or what's missing
3. Assign a score within the weight range

End with overall score (out of 100) and summary.`
}

export function AIGrader({ homeworkTitle, homeworkId, rubricCriteria }: AIGraderProps) {
  const account = useActiveAccount()
  const [code, setCode] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [copied, setCopied] = useState(false)
  const [score, setScore] = useState("")
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")

  // Load existing score
  useEffect(() => {
    if (!account?.address) return
    fetch(`/api/grades?wallet=${account.address}`)
      .then((r) => r.json())
      .then((data) => {
        const grade = data.grades?.find(
          (g: { homework_id: string }) => g.homework_id === homeworkId
        )
        if (grade) {
          setSavedScore(grade.score)
          setScore(String(grade.score))
        }
      })
      .catch(() => {})
  }, [account?.address, homeworkId])

  function handleGenerate() {
    const prompt = buildPrompt(homeworkTitle, rubricCriteria, code)
    setGeneratedPrompt(prompt)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveScore() {
    if (!account?.address || !score.trim()) return
    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) return

    setSaving(true)
    setSaveStatus("idle")
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: account.address,
          homework_id: homeworkId,
          score: numScore,
        }),
      })
      if (res.ok) {
        setSavedScore(numScore)
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="my-8">
      <Accordion type="single" collapsible>
        <AccordionItem value="ai-grader" className="rounded-lg border border-border bg-card">
          <AccordionTrigger className="px-5">
            <div className="flex items-center gap-3">
              <Bot className="size-5 text-primary" />
              <div className="text-left">
                <span className="block text-sm font-semibold text-foreground">
                  AI Grader
                </span>
                <span className="block text-xs text-muted-foreground">
                  Get AI-powered feedback on your code
                  {savedScore !== null && (
                    <span className="ml-2 text-primary font-medium">
                      Score: {savedScore}/100
                    </span>
                  )}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5">
            <div className="space-y-4">
              {/* Code input textarea */}
              <div>
                <label
                  htmlFor="student-code"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Paste Your Code
                </label>
                <textarea
                  id="student-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your Solidity contract code here..."
                  className="w-full min-h-[200px] rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!code.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate Grading Prompt
              </button>

              {/* Generated prompt output */}
              {generatedPrompt && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Generated Prompt
                  </label>
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    className="w-full min-h-[300px] rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm text-foreground focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Model-agnostic note */}
              <p className="text-xs text-muted-foreground">
                This prompt works with any AI model -- paste it into ChatGPT,
                Claude, or any other AI assistant.
              </p>

              {/* Score input + save */}
              <div className="border-t border-border pt-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Save Your Score
                </label>
                <p className="mb-3 text-xs text-muted-foreground">
                  After grading with an AI model, enter your overall score below.
                  {!account && " Connect your wallet to save."}
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="0-100"
                    className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">/ 100</span>
                  <button
                    onClick={handleSaveScore}
                    disabled={!account || !score.trim() || saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saveStatus === "saved" ? (
                      <>
                        <Check className="size-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        {saving ? "Saving..." : "Save Score"}
                      </>
                    )}
                  </button>
                </div>
                {saveStatus === "error" && (
                  <p className="mt-2 text-xs text-destructive">
                    Failed to save. Please try again.
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
