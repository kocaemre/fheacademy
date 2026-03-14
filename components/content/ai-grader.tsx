"use client"

import { useState } from "react"
import { Bot, Check, Copy } from "lucide-react"
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

End with overall score and summary.`
}

export function AIGrader({ homeworkTitle, rubricCriteria }: AIGraderProps) {
  const [code, setCode] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    const prompt = buildPrompt(homeworkTitle, rubricCriteria, code)
    setGeneratedPrompt(prompt)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
