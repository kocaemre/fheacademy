"use client"

import { useEffect, useState } from "react"
import { Github, Check, Send, ExternalLink } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"

export function CapstoneSubmission() {
  const account = useActiveAccount()
  const [repoUrl, setRepoUrl] = useState("")
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")

  // Load existing submission
  useEffect(() => {
    if (!account?.address) return
    fetch(`/api/capstone?wallet=${account.address}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.submission?.repo_url) {
          setSavedUrl(data.submission.repo_url)
          setRepoUrl(data.submission.repo_url)
        }
      })
      .catch(() => {})
  }, [account?.address])

  async function handleSubmit() {
    if (!account?.address || !repoUrl.trim()) return
    if (!repoUrl.includes("github.com")) return

    setSaving(true)
    setSaveStatus("idle")
    try {
      const res = await fetch("/api/capstone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: account.address,
          repo_url: repoUrl.trim(),
        }),
      })
      if (res.ok) {
        setSavedUrl(repoUrl.trim())
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        Submit Your Capstone
      </h2>
      <div className="rounded-lg border border-primary/30 bg-card p-6">
        <div className="flex items-start gap-3 mb-4">
          <Github className="mt-0.5 size-5 text-primary shrink-0" />
          <div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Submit your GitHub repository link below. Your capstone will be
              <strong className="text-foreground"> manually reviewed</strong> by
              our team. After review, you will receive feedback via email and a
              completion certificate NFT upon passing.
            </p>
          </div>
        </div>

        {savedUrl && saveStatus !== "saved" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
            <Check className="size-4 text-success shrink-0" />
            <span className="text-sm text-foreground">Submitted: </span>
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {savedUrl.replace("https://", "")}
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}

        {!account ? (
          <p className="text-sm text-muted-foreground">
            Connect your wallet to submit your capstone project.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/my-fhevm-project"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSubmit}
              disabled={!repoUrl.trim() || !repoUrl.includes("github.com") || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveStatus === "saved" ? (
                <>
                  <Check className="size-4" />
                  Submitted
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  {saving ? "Submitting..." : savedUrl ? "Update" : "Submit"}
                </>
              )}
            </button>
          </div>
        )}

        {saveStatus === "error" && (
          <p className="mt-2 text-xs text-destructive">
            Failed to submit. Please try again.
          </p>
        )}
      </div>
    </section>
  )
}
