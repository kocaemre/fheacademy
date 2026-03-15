import { curriculum } from "@/lib/curriculum"

export function CurriculumOverview() {
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
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-secondary/60 to-success/60 sm:left-8" />

          <div className="space-y-0">
            {curriculum.map((week, index) => {
              const isLast = index === curriculum.length - 1
              const colors = [
                { dot: "bg-primary", ring: "ring-primary/20", accent: "text-primary" },
                { dot: "bg-secondary", ring: "ring-secondary/20", accent: "text-secondary" },
                { dot: "bg-accent", ring: "ring-accent/20", accent: "text-accent" },
                { dot: "bg-success", ring: "ring-success/20", accent: "text-success" },
              ]
              const color = colors[index] || colors[0]

              return (
                <div key={week.id} className="relative flex gap-5 sm:gap-7 pb-12">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex shrink-0 items-start pt-1">
                    <div
                      className={`flex size-12 items-center justify-center rounded-full ${color.dot} ring-4 ${color.ring} sm:size-16`}
                    >
                      <span className="text-sm font-bold text-background sm:text-base">
                        {week.id}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 rounded-xl border border-border bg-card/50 p-5 sm:p-6 ${!isLast ? "" : ""}`}>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${color.accent}`}>
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
