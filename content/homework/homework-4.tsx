import Link from "next/link"
import { CalloutBox } from "@/components/content/callout-box"
import { AIGrader, type RubricCriterion } from "@/components/content/ai-grader"

const rubricCriteria: RubricCriterion[] = [
  {
    criterion: "Originality",
    weight: "20%",
    exceeds: "Novel concept that demonstrates creative use of FHE beyond course examples, addresses a real-world privacy problem",
    meets: "Reasonable project idea, adapts course patterns to a different use case",
    below: "Direct copy of course examples with minimal modification",
  },
  {
    criterion: "Technical Correctness",
    weight: "25%",
    exceeds: "All FHEVM patterns correct, proper ACL, overflow protection, no deprecated APIs, passes all tests",
    meets: "Core functionality works, minor ACL or guard issues",
    below: "Fundamental FHEVM errors, deprecated patterns, broken core logic",
  },
  {
    criterion: "FHEVM Feature Depth",
    weight: "20%",
    exceeds: "Uses 5+ FHEVM features meaningfully, demonstrates understanding of when and why to use each feature",
    meets: "Uses 3-4 features correctly with reasonable justification",
    below: "Fewer than 3 features, or features used without clear purpose",
  },
  {
    criterion: "Documentation",
    weight: "15%",
    exceeds: "Clear README with architecture diagram, setup instructions, FHEVM features explained, and design decisions documented",
    meets: "README with basic setup instructions and feature list",
    below: "No README or insufficient documentation",
  },
  {
    criterion: "Presentation",
    weight: "20%",
    exceeds: "Clear 2-minute demo showing all features, well-narrated, demonstrates understanding of privacy implications",
    meets: "Demo covers core functionality, adequate narration",
    below: "No demo, or demo does not show the dApp working",
  },
]

export function Homework4Content() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error">
            Advanced
          </span>
          <span className="text-sm text-muted-foreground">
            Week 4 Homework
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Homework: Capstone -- Student-Chosen Confidential dApp
        </h1>
        <p className="text-lg leading-relaxed text-text-secondary">
          The capstone is your chance to demonstrate everything you have learned.
          Design, build, and deploy your own confidential dApp using FHEVM.
          This is an open-ended project -- creativity and technical depth are
          equally valued. Choose a category below or propose your own idea.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="leading-relaxed text-text-secondary">
          Over the past four weeks, you have progressed from understanding why
          privacy matters on-chain to deploying confidential smart contracts on
          testnet. The capstone project brings it all together: you will
          design a confidential dApp from scratch, implement the smart contract
          with FHEVM, write a comprehensive test suite, build a frontend, and
          document your work. This is your portfolio piece -- make it count.
        </p>
      </section>

      {/* Category Options */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Project Categories
        </h2>
        <p className="mb-4 leading-relaxed text-text-secondary">
          Choose one of the following categories, or propose your own idea. Each
          category includes suggested FHEVM features to incorporate:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Category 1: Voting */}
          <div className="rounded-lg border-l-4 border-l-secondary border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">&#x1f5f3;</span>
              <h3 className="text-lg font-semibold text-foreground">
                Confidential Voting System
              </h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-text-secondary">
              Encrypted votes with private tallying and public result
              announcement. Prevents vote buying and coercion.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                externalEbool
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                FHE.select
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                FHE.makePubliclyDecryptable
              </span>
            </div>
          </div>

          {/* Category 2: Token Swap */}
          <div className="rounded-lg border-l-4 border-l-secondary border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">&#x1f504;</span>
              <h3 className="text-lg font-semibold text-foreground">
                Private Token Swap
              </h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-text-secondary">
              Encrypted order matching that is MEV-resistant. Trade without
              revealing your order price or size until matched.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                euint64
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                FHE.ge + FHE.select
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                ACL system
              </span>
            </div>
          </div>

          {/* Category 3: Credentials */}
          <div className="rounded-lg border-l-4 border-l-secondary border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">&#x1f510;</span>
              <h3 className="text-lg font-semibold text-foreground">
                Encrypted Credentials / DID
              </h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-text-secondary">
              On-chain identity with selective disclosure. Store credentials
              encrypted and reveal only what is necessary.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                eaddress
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                FHE.eq
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                Selective ACL (FHE.allow)
              </span>
            </div>
          </div>

          {/* Category 4: Game */}
          <div className="rounded-lg border-l-4 border-l-secondary border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">&#x1f3b2;</span>
              <h3 className="text-lg font-semibold text-foreground">
                Privacy-Preserving Game
              </h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-text-secondary">
              Hidden game state with encrypted randomness. Build a game where
              players cannot cheat by reading on-chain state.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                FHE.randEuint32
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                Encrypted inputs
              </span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                FHE.select
              </span>
            </div>
          </div>
        </div>

        <CalloutBox type="tip" title="Not Limited to These Categories">
          Feel free to propose your own idea as long as it uses at least 3
          FHEVM features. Some ideas: confidential supply chain tracking,
          encrypted health records, private DAO governance, sealed-bid NFT
          marketplace. If you are unsure, discuss with the instructor before
          starting.
        </CalloutBox>
      </section>

      {/* Deliverables */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Deliverables
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                <strong className="text-foreground">Smart contract</strong>{" "}
                deployed to Sepolia testnet or working in mock mode with all
                FHEVM features implemented
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                <strong className="text-foreground">Test suite</strong> with
                minimum 5 test cases covering functional, permission, and edge
                case categories
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                <strong className="text-foreground">Simple React frontend</strong>{" "}
                that connects to the contract, sends encrypted inputs, and
                displays decrypted results
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                <strong className="text-foreground">README</strong> with project
                description, architecture overview, setup instructions, and
                FHEVM features used
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                5
              </span>
              <span className="leading-relaxed">
                <strong className="text-foreground">2-minute demo video</strong>{" "}
                showing the dApp in action (screen recording with narration)
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* FHEVM Feature Depth */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          FHEVM Feature Depth Expectations
        </h2>
        <p className="mb-4 leading-relaxed text-text-secondary">
          Your project should demonstrate meaningful use of FHEVM features.
          The more features you incorporate, the stronger your submission:
        </p>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-foreground">
                Minimum (3 features):
              </span>
              <p className="text-sm text-text-secondary">
                Encrypted types + FHE operations + ACL system
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">
                Expected (4 features):
              </span>
              <p className="text-sm text-text-secondary">
                Above + decryption (v0.9 model) OR encrypted inputs with ZKPoK
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-success">
                Exceeds (5+ features):
              </span>
              <p className="text-sm text-text-secondary">
                Uses encrypted types, FHE.select, ACL system, decryption (v0.9
                model), FHE randomness, and encrypted inputs. Demonstrates
                mastery of the full FHEVM toolkit.
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-text-muted">
              Available features: encrypted types (euintXX, ebool, eaddress) |
              FHE.select | ACL system (FHE.allow, FHE.allowThis) | decryption
              (FHE.makePubliclyDecryptable + relayer SDK) | FHE randomness
              (FHE.randEuintXX) | encrypted inputs (externalEuintXX +
              FHE.fromExternal)
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Getting Started
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="leading-relaxed text-text-secondary">
            Start with your development environment from{" "}
            <Link
              href="/week/1/lesson/development-environment-setup"
              className="text-primary hover:underline"
            >
              Lesson 1.3: Development Environment Setup
            </Link>
            . Review the sealed-bid auction from{" "}
            <Link
              href="/week/3/lesson/auction-and-voting-patterns"
              className="text-primary hover:underline"
            >
              Lesson 3.5
            </Link>{" "}
            as inspiration for structuring your project.
          </p>
          <div className="mt-4 rounded-lg bg-surface p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Recommended approach:
            </p>
            <ol className="space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  1
                </span>
                <span>Start with the smart contract -- get the core logic working in mock mode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  2
                </span>
                <span>Write your test suite (aim for 5+ tests across all categories)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  3
                </span>
                <span>Build the React frontend with encrypted input/output handling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  4
                </span>
                <span>Deploy to Sepolia testnet and verify everything works</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  5
                </span>
                <span>Record your demo video and write the README</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Grading Rubric */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Grading Rubric
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          Passing score: 70% overall
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Criteria
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Weight
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Exceeds (90-100)
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Meets (70-89)
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Below (0-69)
                </th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Originality
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Novel concept that demonstrates creative use of FHE beyond
                  course examples, addresses a real-world privacy problem
                </td>
                <td className="border border-border px-4 py-2.5">
                  Reasonable project idea, adapts course patterns to a different
                  use case
                </td>
                <td className="border border-border px-4 py-2.5">
                  Direct copy of course examples with minimal modification
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Technical Correctness
                </td>
                <td className="border border-border px-4 py-2.5">25%</td>
                <td className="border border-border px-4 py-2.5">
                  All FHEVM patterns correct, proper ACL, overflow protection,
                  no deprecated APIs, passes all tests
                </td>
                <td className="border border-border px-4 py-2.5">
                  Core functionality works, minor ACL or guard issues
                </td>
                <td className="border border-border px-4 py-2.5">
                  Fundamental FHEVM errors, deprecated patterns, broken
                  core logic
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  FHEVM Feature Depth
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Uses 5+ FHEVM features meaningfully (not just to check
                  boxes), demonstrates understanding of when and why to use
                  each feature
                </td>
                <td className="border border-border px-4 py-2.5">
                  Uses 3-4 features correctly with reasonable justification
                </td>
                <td className="border border-border px-4 py-2.5">
                  Fewer than 3 features, or features used without clear purpose
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Documentation
                </td>
                <td className="border border-border px-4 py-2.5">15%</td>
                <td className="border border-border px-4 py-2.5">
                  Clear README with architecture diagram, setup instructions,
                  FHEVM features explained, and design decisions documented
                </td>
                <td className="border border-border px-4 py-2.5">
                  README with basic setup instructions and feature list
                </td>
                <td className="border border-border px-4 py-2.5">
                  No README or insufficient documentation
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Presentation
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Clear 2-minute demo showing all features, well-narrated,
                  demonstrates understanding of privacy implications
                </td>
                <td className="border border-border px-4 py-2.5">
                  Demo covers core functionality, adequate narration
                </td>
                <td className="border border-border px-4 py-2.5">
                  No demo, or demo does not show the dApp working
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Grader */}
      <AIGrader
        homeworkTitle="Capstone: Student-Chosen Confidential dApp"
        rubricCriteria={rubricCriteria}
      />

      {/* Submission Guidelines */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Submission Guidelines
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                Create a GitHub repository with all project code (contract,
                tests, frontend, README)
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                Ensure all tests pass in mock mode ({" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  npx hardhat test
                </code>
                ) before submission
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                Include a link to your 2-minute demo video (YouTube, Loom, or
                similar)
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                If deployed to Sepolia, include the contract address and
                deployment transaction hash in your README
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                5
              </span>
              <span className="leading-relaxed">
                Submit the GitHub repository link and demo video link via the
                course submission form
              </span>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
