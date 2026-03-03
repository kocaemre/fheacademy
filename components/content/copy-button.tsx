"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded bg-surface hover:bg-surface-hover text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}
