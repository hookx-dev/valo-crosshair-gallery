import Link from "next/link";
import type { Metadata } from "next";
import { CrosshairDetail } from "@/components/CrosshairDetail";
import { pageMetadata } from "@/lib/pageMetadata";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const FALLBACK_METADATA = pageMetadata({
  title: "クロスヘア詳細 | VALO Crosshair Gallery",
  description: "VALORANTのクロスヘア設定の詳細とインポートコード。",
});

// Firestore Security Rulesは承認済み(status == "approved")のみ読み取りを許可しており、
// クエリのwhere句が無い素の一括リスト取得は拒否される。runQueryでstatusを明示的に絞り込む。
export async function generateStaticParams() {
  if (!PROJECT_ID) return [];
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "crosshairs" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "approved" },
              },
            },
            limit: 300,
          },
        }),
      }
    );
    if (!res.ok) return [];
    const rows: { document?: { name: string } }[] = await res.json();
    return rows
      .filter((row) => row.document)
      .map((row) => ({ id: row.document!.name.split("/").pop() as string }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!PROJECT_ID) return FALLBACK_METADATA;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/crosshairs/${params.id}`
    );
    if (!res.ok) return FALLBACK_METADATA;
    const doc: { fields?: { name?: { stringValue?: string } } } = await res.json();
    const name = doc.fields?.name?.stringValue;
    if (!name) return FALLBACK_METADATA;
    return pageMetadata({
      title: `${name} | VALO Crosshair Gallery`,
      description: `${name}のVALORANTクロスヘア設定とインポートコード。ワンクリックでコピーしてゲームに反映できます。`,
      path: `/crosshairs/${params.id}`,
    });
  } catch {
    return FALLBACK_METADATA;
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
