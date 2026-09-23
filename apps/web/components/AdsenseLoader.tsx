"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const ADSENSE_CLIENT_ID = "ca-pub-2809438929408465";

// コンテンツを含まない/行動目的の画面(ログイン・投稿フォームなど)では
// AdSenseの審査ポリシーに抵触するため広告スクリプトを読み込まない。
const AD_EXCLUDED_PATH_PREFIXES = ["/admin", "/submit"];

export function AdsenseLoader() {
  const pathname = usePathname();
  const isExcluded = AD_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );

  if (isExcluded) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
