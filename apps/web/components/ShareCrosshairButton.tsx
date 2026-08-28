"use client";

import { useState } from "react";

interface ShareCrosshairButtonProps {
  id: string;
  name: string;
  code: string;
  className?: string;
}

const SITE_BASE_URL = "https://valorant-crosshair-hub.pages.dev";

function imageUrlFor(code: string): string {
  return `${SITE_BASE_URL}/api/crosshair-image?code=${encodeURIComponent(code)}`;
}

function shareTextFor(name: string, code: string, pageUrl: string): string {
  return `${name}\nインポートコード: ${code}\n${pageUrl}`;
}

export function ShareCrosshairButton({ id, name, code, className = "" }: ShareCrosshairButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  async function handleShare() {
    const pageUrl = `${SITE_BASE_URL}/crosshairs/${id}`;
    const text = shareTextFor(name, code, pageUrl);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const shareData: ShareData = { title: name, text, url: pageUrl };

        // 対応ブラウザでは画像ファイルも一緒に共有する(未対応時はテキスト+URLのみにフォールバック)。
        try {
          const res = await fetch(imageUrlFor(code));
          const blob = await res.blob();
          const file = new File([blob], `${name}.png`, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            shareData.files = [file];
          }
        } catch {
          // 画像取得に失敗してもテキスト共有は続行する
        }

        await navigator.share(shareData);
        setStatus("shared");
        setTimeout(() => setStatus("idle"), 1500);
        return;
      } catch {
        // ユーザーがキャンセルした場合等はコピーにフォールバックしない
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      // クリップボードAPIが使えない環境では何もしない
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`clip-corner-sm border border-valo-line bg-valo-panel px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-valo-red hover:text-white ${className}`}
    >
      {status === "copied" ? "コピーしました" : status === "shared" ? "共有しました" : "共有する"}
    </button>
  );
}
