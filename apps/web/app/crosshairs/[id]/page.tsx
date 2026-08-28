import Link from "next/link";
import type { Metadata } from "next";
import { CrosshairDetail } from "@/components/CrosshairDetail";

export const metadata: Metadata = { title: "クロスヘア詳細 | VALO Crosshair Gallery" };

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export async function generateStaticParams() {
  if (!PROJECT_ID) return [];
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/crosshairs?pageSize=300`
    );
    if (!res.ok) return [];
    const data: { documents?: { name: string }[] } = await res.json();
    return (data.documents ?? []).map((doc) => ({
      id: doc.name.split("/").pop() as string,
    }));
  } catch {
    return [];
  }
}

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
