"use client";

import { useState } from "react";

interface ShareCrosshairButtonProps {
  id: string;
  name: string;
  code: string;
  className?: string;
}

type Status = "idle" | "copied-full" | "copied-text" | "shared" | "failed";

const STATUS_LABEL: Record<Status, string> = {
  idle: "共有する",
  "copied-full": "画像+コードをコピーしました",
  "copied-text": "コードをコピーしました",
  shared: "共有しました",
  failed: "コピーに失敗しました",
};

const SITE_BASE_URL = "https://valorant-crosshair-hub.pages.dev";

function imageUrlFor(code: string): string {
  return `${SITE_BASE_URL}/api/crosshair-image?code=${encodeURIComponent(code)}`;
}

function shareTextFor(name: string, code: string, pageUrl: string): string {
  return `${name}\nインポートコード: ${code}\n${pageUrl}`;
}

// Discordなどに貼り付けたときに画像として展開されるよう、可能な場合は画像とテキストの
// 両方をひとつのクリップボードアイテムとして書き込む(貼り付け先が対応する形式を選ぶ)。
// Safariはユーザー操作の同期実行中にClipboardItemを生成する必要があるため、
// 画像取得のPromiseをawaitせずそのままClipboardItemへ渡す。
async function copyImageAndText(code: string, text: string): Promise<Status> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const imageBlobPromise = fetch(imageUrlFor(code)).then((res) => {
        if (!res.ok) throw new Error("image fetch failed");
        return res.blob();
      });
      const item = new ClipboardItem({
        "image/png": imageBlobPromise,
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
      return "copied-full";
    } catch {
      // 画像コピー非対応・失敗時はテキストのみのコピーにフォールバックする
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied-text";
  } catch {
    return "failed";
  }
}

export function ShareCrosshairButton({ id, name, code, className = "" }: ShareCrosshairButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  function resetSoon() {
    setTimeout(() => setStatus("idle"), 2000);
  }

  async function handleShare() {
    const pageUrl = `${SITE_BASE_URL}/crosshairs/${id}`;
    const text = shareTextFor(name, code, pageUrl);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const shareData: ShareData = { title: name, text, url: pageUrl };

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
        resetSoon();
        return;
      } catch (err) {
        // ユーザーが共有をキャンセルした場合は何もしない
        if (err instanceof Error && err.name === "AbortError") return;
        // それ以外の失敗(未対応の組み合わせ等)はクリップボードコピーにフォールバックする
      }
    }

    const result = await copyImageAndText(code, text);
    setStatus(result);
    resetSoon();
  }

  return (
    <button
      onClick={handleShare}
      className={`clip-corner-sm border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
        status === "failed"
          ? "border-valo-red text-valo-red"
          : "border-valo-line bg-valo-panel text-gray-300 hover:border-valo-red hover:text-white"
      } ${className}`}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}
