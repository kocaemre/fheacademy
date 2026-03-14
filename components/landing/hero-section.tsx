import Link from "next/link"

export function HeroSection() {
  return (
    <section className="hero-gradient relative min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-6">
          4-Week FHEVM Developer Bootcamp
        </p>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary leading-[1.1] mb-6">
          Learn to Build{" "}
          <span className="text-primary">Confidential</span>{" "}
          Smart Contracts
        </h1>

        <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
          Master Zama&apos;s FHEVM from zero to production. Build encrypted DeFi,
          private voting, and sealed-bid auctions with fully homomorphic
          encryption on Ethereum.
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

        <p className="mt-6 text-sm text-text-muted">
          20 lessons &middot; 4 assignments &middot; 1 capstone project
        </p>
      </div>
    </section>
  )
}
