"use client";

import { useState } from "react";
import Link from "next/link";
import { CrosshairPreview } from "./CrosshairPreview";
import { DEFAULT_PREVIEW_BACKGROUND } from "@/lib/parseCrosshairCode";

// 背景色によって視認性が変わるため、代表的なマップの壁面色を模した色見本を用意している。
// 実際のゲーム画面のスクリーンショットは著作権上使えないため、単色の近似で代用。
// vcrdb.netに合わせ、黒アウトラインが常にはっきり見えるコンクリート(中間グレー)を
// デフォルトにしている(ダークだとアウトラインがほぼ同化して見えなくなるため)。
const BACKGROUNDS = [
  { label: "コンクリート", value: DEFAULT_PREVIEW_BACKGROUND },
  { label: "ダーク", value: "#0f151c" },
  { label: "サンド", value: "#c2a878" },
  { label: "フォレスト", value: "#2f4a34" },
  { label: "スカイ", value: "#7fb2d6" },
  { label: "スノー", value: "#e6e9ec" },
];

// 実寸プレビューは1920x1080(フルHD)を基準に、太さ・長さを一切拡大せず絶対px数のまま
// 中央に描く。実際のゲーム画面で見えるのと同じくらい小さく・見にくくなるが、それが正しい。
const REAL_CANVAS_WIDTH = 1920;
const REAL_CANVAS_HEIGHT = 1080;

export function CrosshairDetailPreview({ code, name }: { code: string; name?: string }) {
  const [background, setBackground] = useState(BACKGROUNDS[0].value);
  const [mode, setMode] = useState<"zoom" | "real">("zoom");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 border border-valo-line p-1">
        <button
          type="button"
          onClick={() => setMode("zoom")}
          className={`px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-widest transition-colors ${
            mode === "zoom" ? "bg-valo-red text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          拡大表示
        </button>
        <button
          type="button"
          onClick={() => setMode("real")}
          className={`px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-widest transition-colors ${
            mode === "real" ? "bg-valo-red text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          実寸プレビュー(1920x1080換算)
        </button>
      </div>

      <div className="clip-corner overflow-hidden border border-valo-line">
        <div className={mode === "zoom" ? "flex items-center justify-center py-6" : "w-full"}>
          {mode === "zoom" ? (
            <CrosshairPreview
              code={code}
              background={background}
              className="h-32 w-32 shrink-0"
              label={name ? `${name}のプレビュー` : undefined}
            />
          ) : (
            <CrosshairPreview
              code={code}
              background={background}
              className="aspect-video w-full"
              canvasWidth={REAL_CANVAS_WIDTH}
              canvasHeight={REAL_CANVAS_HEIGHT}
              showCorners={false}
              label={name ? `${name}の実寸プレビュー` : undefined}
            />
          )}
        </div>
      </div>

      {mode === "real" && (
        <p className="text-[11px] text-gray-500">
          フルHD(1920×1080)のモニターでプレイした場合の見た目の大きさに合わせています。実際のゲーム内ではこの程度の小ささになります。
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          背景
        </span>
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.value}
            type="button"
            onClick={() => setBackground(bg.value)}
            title={bg.label}
            aria-label={bg.label}
            className={`h-6 w-6 border transition-transform hover:scale-110 ${
              background === bg.value ? "border-valo-red" : "border-valo-line"
            }`}
            style={{ backgroundColor: bg.value }}
          />
        ))}
      </div>

      <Link
        href={`/builder?code=${encodeURIComponent(code)}`}
        className="clip-corner-sm w-fit border border-valo-line bg-valo-panel px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-valo-red hover:text-white"
      >
        ビルダーで編集する →
      </Link>
    </div>
  );
}
