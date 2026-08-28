"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
    };
  }
}

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
// Cloudflareが公開している検証用サイトキー(常に成功する)。本番デプロイ時は自分のサイトキーに差し替える。
const TEST_SITE_KEY = "1x00000000000000000000AA";

export function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return;
    window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY,
      callback: onVerify,
    });
  }, [scriptLoaded, onVerify]);

  return <div ref={containerRef} />;
}
