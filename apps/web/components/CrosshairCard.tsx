import Link from "next/link";
import type { Crosshair } from "@/types";
import { CrosshairPreview } from "./CrosshairPreview";
import { CopyCodeButton } from "./CopyCodeButton";
import { translateTag } from "@/lib/tagLabels";

const CATEGORY_META: Record<string, { label: string; accent: string; text: string }> = {
  pro: { label: "PRO", accent: "bg-valo-cyan", text: "text-valo-cyan" },
  meme: { label: "MEME", accent: "bg-valo-yellow", text: "text-valo-yellow" },
  practical: { label: "PRACTICAL", accent: "bg-slate-400", text: "text-slate-300" },
};

export function CrosshairCard({
  crosshair,
  previewClassName = "h-32 w-32 shrink-0",
  previewZoom = 1,
  // trueの場合、プレビュー画像の下にタイトルを配置する(横並びだと長い名前が見切れるため)。
  stacked = false,
}: {
  crosshair: Crosshair;
  previewClassName?: string;
  previewZoom?: number;
  stacked?: boolean;
}) {
  const meta = CATEGORY_META[crosshair.category];

  return (
    <div className="clip-corner group relative flex flex-col gap-3 border border-valo-line bg-valo-panel p-4 transition-colors hover:border-valo-red/60">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${meta.accent}`} />

      <Link
        href={`/crosshairs/${crosshair.id}`}
        className={stacked ? "flex flex-col items-center gap-3 pl-1 text-center" : "flex items-center gap-4 pl-1"}
      >
        <CrosshairPreview
          code={crosshair.code}
          className={previewClassName}
          zoom={previewZoom}
          label={`${crosshair.name}のプレビュー`}
        />
        <div className={stacked ? "flex w-full min-w-0 flex-col items-center gap-1" : "flex min-w-0 flex-col gap-1"}>
          <span className={`w-fit font-display text-xs font-semibold tracking-[0.15em] ${meta.text}`}>
            {meta.label}
          </span>
          <h3
            className={
              stacked
                ? "line-clamp-2 break-words font-display text-lg font-semibold leading-tight text-white group-hover:underline"
                : "truncate font-display text-lg font-semibold leading-tight text-white group-hover:underline"
            }
          >
            {crosshair.name}
          </h3>
          {crosshair.proPlayerName && (
            <span className="text-sm text-gray-400">{crosshair.proPlayerName}</span>
          )}
        </div>
      </Link>

      <code className="truncate border border-valo-line bg-valo-panel2 px-2 py-1.5 font-mono text-xs text-gray-400">
        {crosshair.code}
      </code>

      {crosshair.submittedBy && (
        <p className="text-[11px] text-gray-500">by {crosshair.submittedBy}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {crosshair.tags.map((tag) => (
            <span
              key={tag}
              className="border border-valo-line px-1.5 py-0.5 text-[10px] tracking-wide text-gray-500"
            >
              {translateTag(tag)}
            </span>
          ))}
        </div>
        <CopyCodeButton code={crosshair.code} />
      </div>
    </div>
  );
}
