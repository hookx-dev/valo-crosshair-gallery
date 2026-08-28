export interface Crosshair {
  id: string;
  name: string;
  code: string;
  category: "pro" | "meme" | "practical";
  proPlayerName: string | null;
  submittedBy: string | null;
  tags: string[];
  imageUrl: string;
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

// crosshairsコレクションはFirestore Security Rulesで公開読み取り(allow read: if true)なので、
// 認証なしの素のfetchでREST APIを叩くだけでよい(書き込みで使うサービスアカウントJWTは不要)。
export async function fetchAllCrosshairs(projectId: string): Promise<Crosshair[]> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/crosshairs?pageSize=300`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch crosshairs: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { documents?: FirestoreDocument[] };
  return (data.documents ?? []).map(fromFirestoreDocument);
}
