import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryCrosshairList } from "@/components/category/CategoryCrosshairList";
import { pageMetadata } from "@/lib/pageMetadata";
import type { CrosshairCategory } from "@/types";

const CATEGORY_META: Record<CrosshairCategory, { label: string; desc: string }> = {
  pro: { label: "プロ選手", desc: "プロ選手が実際に使用しているクロスヘア設定を集めました。" },
  meme: { label: "ネタ系", desc: "見て楽しい、ネタとして使うクロスヘアを集めました。" },
  practical: { label: "実用系", desc: "視認性・エイムのしやすさを重視した実用クロスヘアを集めました。" },
};

function isValidCategory(value: string): value is CrosshairCategory {
  return value in CATEGORY_META;
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  if (!isValidCategory(params.category)) return {};
  const meta = CATEGORY_META[params.category];
  return pageMetadata({
    title: `${meta.label}のクロスヘア一覧 | VALO Crosshair Gallery`,
    description: meta.desc,
    path: `/category/${params.category}`,
  });
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  if (!isValidCategory(params.category)) notFound();
  const meta = CATEGORY_META[params.category];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">CATEGORY</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">{meta.label}のクロスヘア</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-400">{meta.desc}</p>

      <CategoryCrosshairList category={params.category} />
    </main>
  );
}
