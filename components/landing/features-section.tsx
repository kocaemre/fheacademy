import { Lock, Cpu, Unlock } from "lucide-react"

const features = [
  {
    title: "Side-by-Side Code Comparisons",
    description:
      "Every lesson shows the transformation from Solidity to FHEVM with syntax-highlighted diffs.",
  },
  {
    title: "Interactive Quizzes",
    description:
      "Test your understanding after each lesson. Instant feedback before moving to hands-on work.",
  },
  {
    title: "AI-Powered Grading",
    description:
      "Get detailed feedback on your homework from any AI model. No API keys required.",
  },
  {
    title: "Progress Tracking",
    description:
      "Track completion across 20 lessons and 4 assignments. Syncs with your wallet.",
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Built for Learning
          </h2>
        </div>

        {/* Clean feature list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 mb-24">
          {features.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-base font-semibold text-text-primary mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* FHE Flow Diagram */}
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
