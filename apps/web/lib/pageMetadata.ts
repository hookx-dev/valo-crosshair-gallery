import type { Metadata } from "next";

export const SITE_NAME = "VALO Crosshair Gallery";
export const SITE_URL = "https://valorant-crosshair-hub.pages.dev";

// 各ページのmetadataをこの関数経由で作ることで、OGP/Twitterカードの設定漏れを防ぐ。
export function pageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
