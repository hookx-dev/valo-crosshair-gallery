import { firestoreDocsUrl, getGoogleAccessToken, timingSafeEqual } from "../_lib/firestoreAdmin";
import { clientIp, isRateLimited, recordHit } from "../_lib/rateLimit";

interface Env {
  ADMIN_SECRET: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  // 未バインドでも動作するようにoptional扱いにする(ADMIN_SECRETの総当たり対策)。
  RATE_LIMIT_KV?: KVNamespace;
}

interface ModerateBody {
  id?: unknown;
  action?: unknown;
}

// ADMIN_SECRETの総当たりを抑止するための、認証失敗回数の上限(ウィンドウ内)。
const AUTH_FAIL_MAX = 10;
const AUTH_FAIL_WINDOW_SECONDS = 15 * 60; // 15分

// 投稿を承認(status: approved)または却下(ドキュメント削除)する。
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const ip = clientIp(request);
  const rateLimitKey = `admin-auth-fail:${ip}`;
  if (await isRateLimited(env.RATE_LIMIT_KV, ip, rateLimitKey, AUTH_FAIL_MAX)) {
    return json({ error: "rate_limited" }, 429);
  }

  const secret = request.headers.get("x-admin-secret") ?? "";
  if (!env.ADMIN_SECRET || !timingSafeEqual(secret, env.ADMIN_SECRET)) {
    await recordHit(env.RATE_LIMIT_KV, ip, rateLimitKey, AUTH_FAIL_WINDOW_SECONDS);
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
