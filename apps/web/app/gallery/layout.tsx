import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "クロスヘアギャラリー | VALO Crosshair Gallery",
  description: "プロ選手・ネタ系・実用系のVALORANTクロスヘアをカテゴリ・検索で絞り込んで探せます。",
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
