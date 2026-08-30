import { fromFirestoreFields, firestoreDocsUrl, getGoogleAccessToken, timingSafeEqual } from "../_lib/firestoreAdmin";

interface Env {
  ADMIN_SECRET: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

// 承認待ち(status == "pending")の投稿一覧を返す(管理ページから利用)。
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const secret = request.headers.get("x-admin-secret") ?? "";
  if (!env.ADMIN_SECRET || !timingSafeEqual(secret, env.ADMIN_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }

  let accessToken: string;
  try {
    accessToken = await getGoogleAccessToken({
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    });
  } catch {
    return json({ error: "auth_failed" }, 500);
  }

  const runQueryRes = await fetch(
    `${firestoreDocsUrl(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)}:runQuery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "crosshairs" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "pending" },
            },
          },
          // where(等価)とorderBy(別フィールド)の組み合わせはFirestoreの複合インデックスが
          // 必要になるため、並び替えはFirestore側に任せずここで行う。
          limit: 100,
        },
      }),
    }
  );

  if (!runQueryRes.ok) {
    return json({ error: "firestore_query_failed", detail: await runQueryRes.text() }, 502);
  }

  const rows = (await runQueryRes.json()) as { document?: { fields: Record<string, unknown> } }[];
  const crosshairs = rows
    .filter((row) => row.document)
    .map((row) => fromFirestoreFields(row.document!.fields))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return json({ ok: true, crosshairs });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
