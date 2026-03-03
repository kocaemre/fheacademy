import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BookOpen } from "lucide-react"

interface InstructorNotesProps {
  children: React.ReactNode
}

export function InstructorNotes({ children }: InstructorNotesProps) {
  return (
    <Accordion type="single" collapsible className="my-8">
      <AccordionItem
        value="instructor-notes"
        className="rounded-lg border border-border bg-surface/50"
      >
        <AccordionTrigger className="px-4 py-3 text-sm font-medium text-text-muted hover:text-text-secondary [&[data-state=open]>svg]:rotate-180">
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Instructor Notes
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 text-sm text-text-secondary">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
