import type { Metadata } from "next";
import { CategoryGrid } from "@/components/category/CategoryGrid";

export const metadata: Metadata = { title: "カテゴリ一覧 | VALO Crosshair Gallery" };

export default function CategoryIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">BROWSE</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">カテゴリ一覧</h1>

      <CategoryGrid />
    </main>
  );
}
