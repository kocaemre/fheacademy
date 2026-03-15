"use client"

import { useEffect, useRef, useState } from "react"
import { curriculum } from "@/lib/curriculum"

export function CurriculumOverview() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionHeight = rect.height
      const windowHeight = window.innerHeight

      // Calculate how far through the section we've scrolled
      const start = windowHeight * 0.8
      const end = -sectionHeight + windowHeight * 0.3
      const total = start - end
      const current = start - sectionTop
      const pct = Math.max(0, Math.min(1, current / total))
      setProgress(pct)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Curriculum
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A structured path from Solidity fundamentals to production-ready
            confidential dApps. Each week builds on the last.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative" ref={sectionRef}>
          {/* Background line (dim) */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border sm:left-8" />

          {/* Animated progress line */}
          <div
            className="absolute left-6 top-0 w-px bg-primary transition-none sm:left-8"
            style={{ height: `${progress * 100}%` }}
          />

          <div className="space-y-0">
            {curriculum.map((week, index) => {
              const stepProgress = (index + 0.5) / curriculum.length
              const isActive = progress >= stepProgress

              return (
                <div key={week.id} className="relative flex gap-5 sm:gap-7 pb-12">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex shrink-0 items-start pt-1">
                    <div
                      className={`flex size-12 items-center justify-center rounded-full border-2 transition-all duration-500 sm:size-16 ${
                        isActive
                          ? "border-primary bg-primary text-background"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm font-bold sm:text-base">
                        {week.id}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 rounded-xl border p-5 sm:p-6 transition-all duration-500 ${
                      isActive
                        ? "border-primary/30 bg-card/80"
                        : "border-border/50 bg-card/30"
                    }`}
                  >
                    <div className="flex items-baseline gap-3 mb-2">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        Week {week.id}
                      </span>
                      <span className="text-xs text-text-muted">
                        {week.lessons.length} lessons + 1 homework
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-text-primary mb-2 sm:text-xl">
                      {week.title}
                    </h3>

                    <p className="text-sm text-text-secondary leading-relaxed">
                      {week.goal}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
