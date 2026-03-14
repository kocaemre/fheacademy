import Link from "next/link"

export function CtaSection() {
  return (
    <section className="relative px-6 py-24 border-t border-border">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          Ready to Build Confidential dApps?
        </h2>

        <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Join the next generation of blockchain developers building
          privacy-preserving applications with Zama&apos;s FHEVM.
        </p>

        <Link
          href="/week/1/lesson/why-privacy-matters"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          Start Learning
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  )
}
