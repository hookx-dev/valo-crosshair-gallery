import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Rajdhani, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

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
  title: "VALO Crosshair Gallery",
  description: "VALORANTのクロスヘア共有ギャラリー (MVP)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col bg-valo-dark font-sans text-white">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
