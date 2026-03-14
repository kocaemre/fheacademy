import { curriculum } from "@/lib/curriculum"
import { BookOpen, Code, Shield, Rocket } from "lucide-react"

const weekIcons = [BookOpen, Code, Shield, Rocket]

export function CurriculumOverview() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Curriculum
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A structured path from Solidity fundamentals to production-ready
            confidential dApps. Each week builds on the last.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curriculum.map((week, index) => {
            const Icon = weekIcons[index] || BookOpen

            return (
              <div
                key={week.id}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-surface-hover transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Week {week.id}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-2 leading-snug">
                  {week.title}
                </h3>

                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {week.goal}
                </p>

                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{week.lessons.length} lessons</span>
                  <span className="size-1 rounded-full bg-border" />
                  <span>1 homework</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
