"use client";

import { useEffect, useRef } from "react";

const ADSENSE_CLIENT_ID = "ca-pub-2809438929408465";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: string;
  className?: string;
}

export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSenseスクリプトが未読み込み(審査未通過・広告ブロッカー等)の場合は無視
    }
  }, []);

  return (
    <div className={`min-h-[100px] w-full ${className ?? ""}`}>
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
