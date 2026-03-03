export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,197,24,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,197,24,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        {/* Logo / Icon */}
        <div className="mb-8 flex items-center justify-center w-20 h-20 rounded-2xl bg-surface border border-border">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 4L4 12v16l16 8 16-8V12L20 4z"
              stroke="#F5C518"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M20 12l-8 4v8l8 4 8-4v-8l-8-4z"
              stroke="#8B5CF6"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="20" cy="20" r="3" fill="#F5C518" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-primary mb-4">
          FHE Academy
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-text-secondary mb-2">
          4-Week FHEVM Developer Bootcamp
        </p>
        <p className="text-base text-text-muted mb-12">
          Master confidential smart contracts with Zama&apos;s FHEVM
        </p>

        {/* Under Construction Badge */}
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-surface border border-border">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="text-sm font-medium text-text-secondary">
            Under Construction
          </span>
        </div>

        {/* Feature Preview */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="text-sm font-semibold text-text-primary">20 Lessons</h3>
            <p className="text-xs text-text-muted mt-1">From basics to advanced FHE</p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="text-sm font-semibold text-text-primary">Hands-On</h3>
            <p className="text-xs text-text-muted mt-1">Side-by-side code comparisons</p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="text-sm font-semibold text-text-primary">Homework</h3>
            <p className="text-xs text-text-muted mt-1">Weekly graded assignments</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-xs text-text-muted">
        Powered by Zama FHEVM
      </footer>
    </div>
  );
}
