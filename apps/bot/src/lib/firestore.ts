export interface Crosshair {
  id: string;
  name: string;
  code: string;
  category: "pro" | "meme" | "practical";
  proPlayerName: string | null;
  submittedBy: string | null;
  tags: string[];
  status: "pending" | "approved";
  createdAt: string;
}

interface FirestoreValue {
  stringValue?: string;
  doubleValue?: number;
  integerValue?: string;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: FirestoreValue[] };
}

interface FirestoreDocument {
  name: string;
  fields: Record<string, FirestoreValue>;
}

function fromFirestoreValue(value: FirestoreValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.arrayValue !== undefined) return (value.arrayValue.values ?? []).map(fromFirestoreValue);
  return null;
}

function fromFirestoreDocument(doc: FirestoreDocument): Crosshair {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    obj[key] = fromFirestoreValue(value);
  }
  return obj as unknown as Crosshair;
}

// crosshairsコレクションはFirestore Security Rulesで承認済み(status == "approved")のみ
// 公開読み取り可能なので、認証なしの素のfetchでも承認待ちの投稿は取得できない。
// 念のためクエリ側でも明示的にstatusで絞り込む。
export async function fetchAllCrosshairs(projectId: string): Promise<Crosshair[]> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
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
  if (!res.ok) {
    throw new Error(`Failed to fetch crosshairs: ${res.status} ${await res.text()}`);
  }
  const rows = (await res.json()) as { document?: FirestoreDocument }[];
  return rows.filter((row) => row.document).map((row) => fromFirestoreDocument(row.document!));
}
