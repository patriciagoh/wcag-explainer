import { useState } from "react";

type Props = { text: string; label?: string; className?: string };

export function CopyButton({ text, label = "Copy", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center min-h-6 text-xs px-2 py-1 rounded border border-muted bg-paper hover:bg-matcha-tint ${copied ? "text-ok" : "text-ink-2"} ${className}`}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
