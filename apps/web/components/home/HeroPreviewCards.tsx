"use client";

import { useCrosshairs } from "@/lib/hooks/useCrosshairs";
import { CrosshairCard } from "@/components/CrosshairCard";

export function HeroPreviewCards() {
  const { crosshairs, loading } = useCrosshairs();

  if (loading) {
    return <p className="p-4 text-center text-xs text-gray-500">読み込み中...</p>;
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {crosshairs.slice(0, 2).map((crosshair) => (
        <CrosshairCard key={crosshair.id} crosshair={crosshair} />
      ))}
    </div>
  );
}
