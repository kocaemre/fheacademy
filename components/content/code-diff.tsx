import type { JSX } from "react"
import { codeToHtml, codeToHast } from "shiki"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment } from "react"
import { jsx, jsxs } from "react/jsx-runtime"

interface CodeDiffProps {
  solidity: string
  fhevm: string
  solidityFilename?: string
  fhevmFilename?: string
  highlightLines?: number[]
}

export async function CodeDiff({
  solidity,
  fhevm,
  solidityFilename,
  fhevmFilename,
  highlightLines,
}: CodeDiffProps) {
  // Solidity panel: simple HTML rendering (no line highlights needed)
  const solidityHtml = await codeToHtml(solidity, {
    lang: "solidity",
    theme: "vitesse-dark",
  })

  // FHEVM panel: HAST rendering with line highlight transformer
  const fhevmHast = await codeToHast(fhevm, {
    lang: "solidity",
    theme: "vitesse-dark",
    transformers: [
      {
        line(node, line) {
          if (highlightLines?.includes(line)) {
            this.addClassToHast(node, "highlighted-line")
          }
        },
      },
    ],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fhevmJsx = toJsxRuntime(fhevmHast, {
    Fragment,
    jsx: jsx as (type: unknown, props: Record<string, unknown>, key?: string) => JSX.Element,
    jsxs: jsxs as (type: unknown, props: Record<string, unknown>, key?: string) => JSX.Element,
  }) as JSX.Element

  return (
    <div className="my-6 max-w-full rounded-lg border border-code-border overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 min-w-0">
        {/* Solidity Panel */}
        <div className="min-w-0 md:border-r border-code-border border-b md:border-b-0">
          <div className="px-4 py-2 text-xs font-medium text-text-muted border-b border-code-border bg-code-bg">
            {solidityFilename || "Solidity"}
          </div>
          <div
            className="shiki-wrapper overflow-x-auto bg-code-bg"
            dangerouslySetInnerHTML={{ __html: solidityHtml }}
          />
        </div>

        {/* FHEVM Panel */}
        <div className="min-w-0">
          <div className="px-4 py-2 text-xs font-medium text-primary border-b border-code-border bg-code-bg">
            {fhevmFilename || "FHEVM"}
          </div>
          <div className="shiki-wrapper overflow-x-auto bg-code-bg">
            {fhevmJsx}
          </div>
        </div>
      </div>
    </div>
  )
}
