"use client";

import { useState } from "react";

export function CopyCodeButton({ code, className = "" }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // クリップボードAPIが使えない環境では何もしない
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`clip-corner-sm bg-valo-red px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500 active:bg-red-600 ${className}`}
    >
      {copied ? "コピーしました" : "コードをコピー"}
    </button>
  );
}
