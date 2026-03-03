import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  getLesson,
  getWeek,
  getAdjacentLessons,
  getAllLessons,
} from "@/lib/curriculum"
import { LessonLayout } from "@/components/layout/lesson-layout"
import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

interface LessonPageProps {
  params: Promise<{ weekId: string; lessonId: string }>
}

export async function generateStaticParams() {
  return getAllLessons().map(({ weekId, lesson }) => ({
    weekId: String(weekId),
    lessonId: lesson.slug,
  }))
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { weekId, lessonId } = await params
  const weekNum = Number(weekId)
  const lesson = getLesson(weekNum, lessonId)
  const week = getWeek(weekNum)

  if (!lesson || !week) return { title: "Lesson Not Found" }

  return {
    title: `${lesson.title} | Week ${week.id} | FHE Academy`,
    description: `Lesson ${lesson.id}: ${lesson.title} - ${week.title}`,
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { weekId, lessonId } = await params
  const weekNum = Number(weekId)

  const lesson = getLesson(weekNum, lessonId)
  const week = getWeek(weekNum)

  if (!lesson || !week) {
    notFound()
  }

  const adjacent = getAdjacentLessons(weekNum, lessonId)

  // Demo lesson: 1.4 "Your First FHEVM Contract: Counter Migration"
  if (weekNum === 1 && lessonId === "your-first-fhevm-contract") {
    return (
      <LessonLayout
        weekId={week.id}
        weekTitle={week.title}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        learningObjective="Learn how to migrate a standard Solidity contract to use FHEVM encrypted types, operations, and access control."
        prev={adjacent.prev}
        next={adjacent.next}
      >
        <QuizProvider>
          <p className="text-text-secondary leading-relaxed">
            In this lesson, we will migrate a simple Solidity counter contract to
            its FHEVM equivalent. This is the foundational pattern you will
            repeat throughout the course: take familiar Solidity code, identify
            the state variables that need encryption, replace them with encrypted
            types, and wire up the FHE library calls and ACL permissions.
          </p>

          <CodeDiff
            solidity={`// Standard Solidity Counter\nuint256 public count;\n\nfunction increment() public {\n    count += 1;\n}`}
            fhevm={`// FHEVM Encrypted Counter\neuint32 private _count;\n\nfunction increment(\n    externalEuint32 calldata encryptedValue,\n    bytes calldata inputProof\n) public {\n    euint32 eValue = FHE.fromExternal(\n        encryptedValue, inputProof\n    );\n    _count = FHE.add(_count, eValue);\n    FHE.allowThis(_count);\n    FHE.allow(_count, msg.sender);\n}`}
            solidityFilename="Counter.sol"
            fhevmFilename="FHECounter.sol"
            highlightLines={[2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]}
          />

          <CalloutBox type="tip" title="Migration Pattern">
            Notice how every state variable becomes an encrypted type, and every
            operation uses the FHE library. The ACL pattern (allowThis + allow)
            is required for any stored encrypted value.
          </CalloutBox>

          <p className="text-text-secondary leading-relaxed">
            After the migration, the contract&apos;s state is fully encrypted.
            No one can read the counter value on-chain without explicit
            permission from the ACL. The{" "}
            <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
              externalEuint32
            </code>{" "}
            type ensures that user inputs are validated with a zero-knowledge
            proof before being used in computation.
          </p>

          <Quiz
            question={{
              id: "1.4-q1",
              question:
                "Why does the FHEVM counter use `externalEuint32` instead of a regular `uint256` parameter?",
              options: [
                "It's more gas efficient",
                "It validates the encrypted input with a zero-knowledge proof",
                "It allows the value to be larger",
                "It's required by the Solidity compiler",
              ],
              correctIndex: 1,
              explanation:
                "externalEuint32 represents an encrypted value submitted by the user along with a ZKPoK (Zero-Knowledge Proof of Knowledge) that proves they know the plaintext value.",
            }}
          />

          <CodeBlock
            code={`import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";\nimport { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaEthereumConfig.sol";`}
            lang="solidity"
            filename="imports.sol"
          />

          <CalloutBox type="warning" title="ACL Required">
            Forgetting FHE.allowThis() will make the encrypted value
            inaccessible to the contract itself on the next transaction.
          </CalloutBox>

          <Quiz
            question={{
              id: "1.4-q2",
              question:
                "What happens if you forget to call FHE.allowThis() after updating an encrypted state variable?",
              options: [
                "The transaction reverts immediately",
                "The variable becomes zero",
                "The contract cannot access the value in future transactions",
                "Nothing -- it's optional",
              ],
              correctIndex: 2,
              explanation:
                "FHE.allowThis() grants the contract itself permission to read the encrypted value. Without it, the contract cannot perform any operations on that value in subsequent transactions.",
            }}
          />

          <InstructorNotes>
            <p>
              This is the most important lesson in Week 1. Students often
              struggle with:
            </p>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>
                Understanding why ACL is needed (the contract is a separate
                entity from the user)
              </li>
              <li>
                The difference between externalEuint32 (user input) and euint32
                (internal state)
              </li>
              <li>
                Remembering to call allowThis after every state mutation
              </li>
            </ul>
            <p className="mt-2">
              Tip: Have students deliberately omit allowThis and observe the
              error in mock mode.
            </p>
          </InstructorNotes>

          <QuizScore />
        </QuizProvider>
      </LessonLayout>
    )
  }

  // All other lessons: placeholder content
  return (
    <LessonLayout
      weekId={week.id}
      weekTitle={week.title}
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      learningObjective={`Lesson ${lesson.id} content is a ${lesson.type} lesson. Full content will be added in Phase 3.`}
      prev={adjacent.prev}
      next={adjacent.next}
    >
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Lesson content will be added in Phase 3.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/60">
          This is a placeholder for{" "}
          <span className="font-medium text-foreground">{lesson.title}</span>{" "}
          ({lesson.type} lesson).
        </p>
      </div>
    </LessonLayout>
  )
}
