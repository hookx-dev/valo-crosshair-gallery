"use client";

import { useMemo } from "react";
import { useCrosshairs } from "@/lib/hooks/useCrosshairs";
import { CrosshairCard } from "@/components/CrosshairCard";
import type { CrosshairCategory } from "@/types";

export function CategoryCrosshairList({ category }: { category: CrosshairCategory }) {
  const { crosshairs, loading, error } = useCrosshairs();

  const filtered = useMemo(
    () => crosshairs.filter((c) => c.category === category),
    [crosshairs, category]
  );

  if (error) {
    return (
      <p className="mt-8 py-16 text-center text-sm text-valo-red">
        クロスヘアの読み込みに失敗しました。時間をおいて再度お試しください。
      </p>
    );
  }

  if (loading) {
    return <p className="mt-8 py-16 text-center text-sm text-gray-500">読み込み中...</p>;
  }

  if (filtered.length === 0) {
    return (
      <p className="mt-8 py-16 text-center text-sm text-gray-500">
        該当するクロスヘアが見つかりませんでした。
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((crosshair) => (
        <CrosshairCard key={crosshair.id} crosshair={crosshair} />
      ))}
    </div>
  );
}
