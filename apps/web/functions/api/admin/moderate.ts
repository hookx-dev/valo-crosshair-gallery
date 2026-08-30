import { firestoreDocsUrl, getGoogleAccessToken, timingSafeEqual } from "../_lib/firestoreAdmin";

interface Env {
  ADMIN_SECRET: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

interface ModerateBody {
  id?: unknown;
  action?: unknown;
}

// 投稿を承認(status: approved)または却下(ドキュメント削除)する。
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const secret = request.headers.get("x-admin-secret") ?? "";
  if (!env.ADMIN_SECRET || !timingSafeEqual(secret, env.ADMIN_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: ModerateBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const id = String(body.id ?? "").trim();
  const action = String(body.action ?? "");
  if (!id) return json({ error: "invalid_id" }, 400);
  if (action !== "approve" && action !== "reject") {
    return json({ error: "invalid_action" }, 400);
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

  const docUrl = `${firestoreDocsUrl(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, `/crosshairs/${encodeURIComponent(id)}`)}`;

  if (action === "reject") {
    const res = await fetch(docUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return json({ error: "firestore_delete_failed" }, 502);
    return json({ ok: true });
  }

  const res = await fetch(`${docUrl}?updateMask.fieldPaths=status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: { status: { stringValue: "approved" } } }),
  });
  if (!res.ok) return json({ error: "firestore_update_failed" }, 502);

  return json({ ok: true });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
