import type { Metadata } from "next";
import Link from "next/link";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "カテゴリ一覧 | VALO Crosshair Gallery",
  description: "プロ選手・ネタ系・実用系のカテゴリからVALORANTのクロスヘア設定を探せます。",
  path: "/category",
});

export default function CategoryIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">BROWSE</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">カテゴリ一覧</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-400">
        用途に合わせて3つのカテゴリからクロスヘアを探せます。名前やタグで絞り込みたい場合は
        <Link href="/gallery" className="mx-1 text-valo-red underline hover:text-red-400">
          ギャラリー
        </Link>
        の検索機能もあわせてご利用ください。
      </p>

      <CategoryGrid />
    </main>
  );
}
