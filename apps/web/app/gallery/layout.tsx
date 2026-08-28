import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "クロスヘアギャラリー | VALO Crosshair Gallery",
  description: "プロ選手・ネタ系・実用系のVALORANTクロスヘアをカテゴリ・検索で絞り込んで探せます。",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
