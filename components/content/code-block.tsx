import { codeToHtml } from "shiki"
import { CopyButton } from "@/components/content/copy-button"

interface CodeBlockProps {
  code: string
  lang?: "solidity" | "typescript" | "shellscript"
  filename?: string
}

export async function CodeBlock({
  code,
  lang = "solidity",
  filename,
}: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vitesse-dark",
  })

  return (
    <div className="relative group rounded-lg border border-code-border bg-code-bg overflow-hidden my-6">
      {filename && (
        <div className="px-4 py-1.5 text-xs text-text-muted border-b border-code-border font-mono">
          {filename}
        </div>
      )}
      <div
        className="shiki-wrapper overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} />
    </div>
  )
}
