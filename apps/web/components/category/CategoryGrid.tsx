"use client";

import Link from "next/link";
import { useCrosshairs } from "@/lib/hooks/useCrosshairs";
import { CategorySamplePreview } from "@/components/home/CategorySamplePreview";

const CATEGORIES = [
  { slug: "pro", label: "プロ選手", desc: "プロ選手が実際に使用しているクロスヘア設定" },
  { slug: "meme", label: "ネタ系", desc: "見て楽しい、ネタとして使うクロスヘア" },
  { slug: "practical", label: "実用系", desc: "視認性・エイムのしやすさを重視した実用クロスヘア" },
] as const;

export function CategoryGrid() {
  const { crosshairs, loading } = useCrosshairs();

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const count = crosshairs.filter((c) => c.category === cat.slug).length;
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="clip-corner group flex flex-col items-center gap-3 border border-valo-line bg-valo-panel p-8 text-center transition-colors hover:border-valo-red/60"
          >
            <CategorySamplePreview category={cat.slug} />
            <span className="font-display text-2xl font-bold text-white">
              {loading ? "--" : String(count).padStart(2, "0")}
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-valo-red group-hover:underline">
              {cat.label}
            </span>
            <p className="text-xs text-gray-500">{cat.desc}</p>
          </Link>
        );
      })}
    </div>
  );
}
