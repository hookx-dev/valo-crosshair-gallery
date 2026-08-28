"use client";

import { useCrosshairs } from "@/lib/hooks/useCrosshairs";
import { CrosshairPreview } from "@/components/CrosshairPreview";
import type { CrosshairCategory } from "@/types";

export function CategorySamplePreview({ category }: { category: CrosshairCategory }) {
  const { crosshairs } = useCrosshairs();
  const sample = crosshairs.find((c) => c.category === category);

  if (!sample) return null;

  return (
    <div className="scale-125">
      <CrosshairPreview code={sample.code} />
    </div>
  );
}
