"use client";

import { useCrosshairs } from "@/lib/hooks/useCrosshairs";

export function HeroStats() {
  const { crosshairs, loading } = useCrosshairs();
  const total = loading ? "--" : String(crosshairs.length).padStart(2, "0");
  const proCount = loading
    ? "--"
    : String(crosshairs.filter((c) => c.category === "pro").length).padStart(2, "0");

  return (
    <div className="mt-12 flex flex-wrap gap-8 border-t border-valo-line/60 pt-6">
      <div className="flex flex-col">
        <span className="font-display text-3xl font-bold text-white">{total}</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500">CROSSHAIRS</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-3xl font-bold text-white">{proCount}</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500">PRO SETTINGS</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-3xl font-bold text-white">3</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500">CATEGORIES</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-3xl font-bold text-white">24/7</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500">DISCORD BOT</span>
      </div>
    </div>
  );
}
