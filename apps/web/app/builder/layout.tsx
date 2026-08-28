import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "クロスヘアビルダー | VALO Crosshair Gallery",
  description: "スライダーで調整しながらプレビューを確認して、オリジナルのVALORANTクロスヘアを作成できます。",
  path: "/builder",
});

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return children;
}
