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
      className={`inline-flex items-center min-h-6 text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50 ${className}`}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
