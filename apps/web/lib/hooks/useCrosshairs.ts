"use client";

import { useEffect, useState } from "react";
import { getAllCrosshairs } from "@/lib/crosshairs";
import type { Crosshair } from "@/types";

export function useCrosshairs() {
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllCrosshairs()
      .then((data) => {
        if (!cancelled) setCrosshairs(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { crosshairs, loading, error };
}
