import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <main className="flex flex-col items-center text-center max-w-lg">
        <p className="text-sm text-text-muted uppercase tracking-widest mb-6">
          Coming Soon
        </p>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary mb-4">
          FHE Academy
        </h1>

        <p className="text-lg text-text-secondary leading-relaxed mb-8">
          Learn to build confidential smart contracts with FHEVM.
          <br />
          A 4-week hands-on bootcamp for Solidity developers.
        </p>

        <div className="h-px w-16 bg-border mb-8" />

        <p className="text-sm text-text-muted mb-8">
          20 lessons &middot; 4 assignments &middot; 1 capstone project
        </p>

        <Link
          href="/week/1/lesson/why-privacy-matters"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          Start Learning
        </Link>
      </main>
    </div>
  );
}
