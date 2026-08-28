"use client";

import { useState } from "react";
import Link from "next/link";
import { CrosshairPreview } from "./CrosshairPreview";

// 背景色によって視認性が変わるため、代表的なマップの壁面色を模した色見本を用意している。
// 実際のゲーム画面のスクリーンショットは著作権上使えないため、単色の近似で代用。
const BACKGROUNDS = [
  { label: "ダーク", value: "#0f151c" },
  { label: "コンクリート", value: "#8a8a86" },
  { label: "サンド", value: "#c2a878" },
  { label: "フォレスト", value: "#2f4a34" },
  { label: "スカイ", value: "#7fb2d6" },
  { label: "スノー", value: "#e6e9ec" },
];

export function CrosshairDetailPreview({ code, name }: { code: string; name?: string }) {
  const [background, setBackground] = useState(BACKGROUNDS[0].value);

  return (
    <div className="flex flex-col gap-4">
      <div className="clip-corner overflow-hidden border border-valo-line">
        <div className="flex scale-[2.5] items-center justify-center py-6">
          <CrosshairPreview
            code={code}
            background={background}
            label={name ? `${name}のプレビュー` : undefined}
          />
        </div>
      </div>

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
