"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCrosshairById, getCrosshairsByCategory } from "@/lib/crosshairs";
import { mockProGear } from "@/data/mock-pro-gear";
import { CrosshairDetailPreview } from "@/components/CrosshairDetailPreview";
import { CrosshairCard } from "@/components/CrosshairCard";
import { CopyCodeButton } from "@/components/CopyCodeButton";
import type { Crosshair } from "@/types";

const CATEGORY_LABEL: Record<string, string> = { pro: "PRO", meme: "MEME", practical: "PRACTICAL" };

function imageUrlFor(code: string): string {
  return `https://valorant-crosshair-hub.pages.dev/api/crosshair-image?code=${encodeURIComponent(code)}`;
}

export function CrosshairDetail({ id }: { id: string }) {
  const [crosshair, setCrosshair] = useState<Crosshair | null | undefined>(undefined);
  const [related, setRelated] = useState<Crosshair[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCrosshairById(id).then(async (found) => {
      if (cancelled) return;
      setCrosshair(found);
      if (found) {
        const sameCategory = await getCrosshairsByCategory(found.category);
        if (!cancelled) {
          setRelated(sameCategory.filter((c) => c.id !== found.id).slice(0, 3));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (crosshair === undefined) {
    return <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>;
  }

  if (crosshair === null) {
    notFound();
  }

  const proProfile = mockProGear.find((p) => p.playerName === crosshair.proPlayerName);

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
        <CrosshairDetailPreview code={crosshair.code} />

        <div className="flex flex-col gap-3">
          <span className="font-display text-xs font-semibold tracking-[0.15em] text-valo-red">
            {CATEGORY_LABEL[crosshair.category]}
          </span>
          <h1 className="font-display text-2xl font-bold text-white">{crosshair.name}</h1>
          {proProfile && (
            <Link href={`/pro/${proProfile.slug}`} className="text-sm text-gray-400 hover:text-white">
              {proProfile.playerName}（{proProfile.team}）の設定を見る →
            </Link>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-gray-500">
              Import Code
            </p>
            <code className="clip-corner-sm break-all border border-valo-line bg-valo-panel2 px-4 py-3 font-mono text-sm text-gray-300">
              {crosshair.code}
            </code>
            <div className="flex flex-wrap gap-2">
              <CopyCodeButton code={crosshair.code} className="w-fit" />
              <a
                href={imageUrlFor(crosshair.code)}
                download={`${crosshair.name}.png`}
                className="clip-corner-sm border border-valo-line bg-valo-panel px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-valo-red hover:text-white"
              >
                画像を保存
              </a>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {crosshair.tags.map((tag) => (
              <span
                key={tag}
                className="border border-valo-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-1 bg-valo-red" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              関連するクロスヘア
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((c) => (
              <CrosshairCard key={c.id} crosshair={c} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
