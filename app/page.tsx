import Link from "next/link"
import { HeroSection } from "@/components/landing/hero-section"
import { CurriculumOverview } from "@/components/landing/curriculum-overview"
import { FeaturesSection } from "@/components/landing/features-section"
import { CtaSection } from "@/components/landing/cta-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <Link href="/" className="text-lg font-bold text-primary">
          FHE Academy
        </Link>
        <Link
          href="/week/1/lesson/why-privacy-matters"
          className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Start Learning
        </Link>
      </nav>

      <main>
        <HeroSection />
        <CurriculumOverview />
        <FeaturesSection />
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-sm text-text-muted">
          Built for the{" "}
          <span className="text-primary font-medium">Zama Bounty Track</span>
        </p>
        <p className="text-xs text-text-muted/60 mt-2">
          Powered by Fully Homomorphic Encryption
        </p>
      </footer>
    </div>
  )
}
