import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "クロスヘアを投稿する | VALO Crosshair Gallery",
  description: "あなたのお気に入りのVALORANTクロスヘア設定をシェアしましょう。",
  path: "/submit",
});

export default function SubmitLayout({ children }: { children: ReactNode }) {
  return children;
}
