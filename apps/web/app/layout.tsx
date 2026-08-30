import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Rajdhani, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata, SITE_URL } from "@/lib/pageMetadata";
import "./globals.css";

const ADSENSE_CLIENT_ID = "ca-pub-2809438929408465";

const display = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: "VALO Crosshair Gallery",
    description: "VALORANTのクロスヘア共有ギャラリー",
  }),
  other: {
    "google-adsense-account": ADSENSE_CLIENT_ID,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col bg-valo-dark font-sans text-white">
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "0ae9667a3c2049da9abf3067e70702f6"}'
          strategy="afterInteractive"
        />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
