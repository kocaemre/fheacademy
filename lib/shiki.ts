import { createHighlighter } from "shiki"

// Module-level singleton -- created once, reused across all server component renders
const highlighterPromise = createHighlighter({
  themes: ["vitesse-dark"],
  langs: ["solidity", "typescript", "shellscript"],
})

export { highlighterPromise }

export async function highlight(
  code: string,
  lang: "solidity" | "typescript" | "shellscript"
): Promise<string> {
  const highlighter = await highlighterPromise
  return highlighter.codeToHtml(code, { lang, theme: "vitesse-dark" })
}
