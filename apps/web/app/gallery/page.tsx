"use client";

import { useMemo, useState } from "react";
import { useCrosshairs } from "@/lib/hooks/useCrosshairs";
import { CrosshairCard } from "@/components/CrosshairCard";
import type { CrosshairCategory } from "@/types";

const CATEGORIES: { value: CrosshairCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "pro", label: "プロ選手" },
  { value: "meme", label: "ネタ系" },
  { value: "practical", label: "実用系" },
];

type SortOrder = "newest" | "name";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "新着順" },
  { value: "name", label: "名前順" },
];

export default function GalleryPage() {
  const { crosshairs, loading, error } = useCrosshairs();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CrosshairCategory | "all">("all");
  const [sort, setSort] = useState<SortOrder>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = crosshairs.filter((crosshair) => {
      const matchesCategory = category === "all" || crosshair.category === category;
      const matchesQuery =
        q.length === 0 ||
        crosshair.name.toLowerCase().includes(q) ||
        crosshair.proPlayerName?.toLowerCase().includes(q) ||
        crosshair.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });

    return [...result].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "ja");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [crosshairs, query, category, sort]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">GALLERY</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">クロスヘアを探す</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`clip-corner-sm px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                category === c.value
                  ? "bg-valo-red text-white"
                  : "border border-valo-line bg-valo-panel text-gray-400 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="名前・選手名・タグで検索"
          className="clip-corner-sm border border-valo-line bg-valo-panel px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-valo-red sm:w-64"
        />
      </div>

      <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-1 bg-valo-red" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            {filtered.length} 件のクロスヘア
          </h2>
        </div>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={`clip-corner-sm px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                sort === option.value
                  ? "bg-valo-red text-white"
                  : "border border-valo-line bg-valo-panel text-gray-500 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="py-16 text-center text-sm text-valo-red">
          クロスヘアの読み込みに失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {!error && loading && (
        <p className="py-16 text-center text-sm text-gray-500">読み込み中...</p>
      )}

      {!error && !loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((crosshair) => (
            <CrosshairCard key={crosshair.id} crosshair={crosshair} stacked />
          ))}
        </div>
      )}

      {!error && !loading && filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-500">
          該当するクロスヘアが見つかりませんでした。
        </p>
      )}
    </main>
  );
}
