import { Code2, Brain, BarChart3, HelpCircle, Lock, Cpu, Unlock } from "lucide-react"

const features = [
  {
    icon: Code2,
    title: "Side-by-Side Code Comparisons",
    description:
      "See exactly how Solidity contracts transform into FHEVM. Every lesson highlights the differences between plaintext and encrypted implementations with syntax-highlighted diffs.",
  },
  {
    icon: HelpCircle,
    title: "Interactive Quizzes",
    description:
      "Test your understanding after each lesson with embedded quizzes. Instant feedback helps you identify gaps before moving on to hands-on work.",
  },
  {
    icon: Brain,
    title: "AI-Powered Grading",
    description:
      "Submit your homework and get detailed feedback from an AI grader that understands FHEVM patterns. Checks correctness, security, and best practices.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track your completion across all 20 lessons and 4 homework assignments. Your progress syncs with your wallet so you never lose your place.",
  },
]

const fheFlowSteps = [
  {
    icon: Lock,
    label: "Encrypt",
    description: "Client encrypts data before sending to chain",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Cpu,
    label: "Compute",
    description: "Smart contract operates on encrypted data",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Unlock,
    label: "Decrypt",
    description: "Authorized parties decrypt the result",
    color: "text-success",
    bgColor: "bg-success/10",
  },
]

export function FeaturesSection() {
  return (
    <section className="px-6 py-24 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Built for Learning
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Every feature is designed to help you go from zero FHE knowledge to
            building production-ready confidential dApps.
          </p>
        </div>

        {/* Platform Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/20 transition-colors"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* FHE Flow Diagram - Visual FHE concept (DSGN-04) */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            How FHE Works
          </h3>
          <p className="text-text-secondary text-sm">
            Fully Homomorphic Encryption enables computation on encrypted data
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
          {fheFlowSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center text-center w-48">
                  <div
                    className={`flex size-16 items-center justify-center rounded-2xl ${step.bgColor} ${step.color} mb-3`}
                  >
                    <Icon className="size-7" />
                  </div>
                  <h4 className={`text-lg font-semibold ${step.color} mb-1`}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < fheFlowSteps.length - 1 && (
                  <div className="hidden sm:flex items-center px-4">
                    <svg
                      className="size-6 text-text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
