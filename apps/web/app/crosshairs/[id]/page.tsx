import Link from "next/link";
import type { Metadata } from "next";
import { CrosshairDetail } from "@/components/CrosshairDetail";

export const metadata: Metadata = { title: "クロスヘア詳細 | VALO Crosshair Gallery" };

export default function CrosshairDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/gallery" className="text-xs text-gray-500 hover:text-gray-300">
        ← ギャラリーに戻る
      </Link>

      <CrosshairDetail id={params.id} />
    </main>
  );
}
