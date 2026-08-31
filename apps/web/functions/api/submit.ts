import { firestoreDocsUrl, getGoogleAccessToken, toFirestoreFields } from "./_lib/firestoreAdmin";
import { clientIp, isRateLimited, recordHit } from "./_lib/rateLimit";

interface Env {
  TURNSTILE_SECRET_KEY: string;
  // ブラウザ用のビルド時設定(NEXT_PUBLIC_FIREBASE_*)を流用し、
  // サーバー専用シークレットとして新規追加するのはCLIENT_EMAIL/PRIVATE_KEYのみにする。
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  // 未バインドでも動作するようにoptional扱いにする(スパム対策は必須ではなく多層防御の一つ)。
  RATE_LIMIT_KV?: KVNamespace;
}

interface SubmitBody {
  name?: unknown;
  code?: unknown;
  category?: unknown;
  submittedBy?: unknown;
  tags?: unknown;
  turnstileToken?: unknown;
}

const CODE_PATTERN = /^0;.{5,200}$/;
const SUBMITTABLE_CATEGORIES = ["meme", "practical"];

// 1つのIPから許容する投稿数(ウィンドウ内)。KV未設定時はスキップされる。
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1時間

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const ip = clientIp(request);
  const rateLimited = await isRateLimited(env.RATE_LIMIT_KV, ip, `submit:${ip}`, RATE_LIMIT_MAX);
  if (rateLimited) {
    return json({ error: "rate_limited" }, 429);
  }

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const name = String(body.name ?? "").trim();
  const code = String(body.code ?? "").trim();
  const category = String(body.category ?? "");
  const submittedBy = String(body.submittedBy ?? "").trim();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 5)
    : [];
  const turnstileToken = String(body.turnstileToken ?? "");

  if (name.length < 1 || name.length > 40) {
    return json({ error: "invalid_name" }, 400);
  }
  if (!CODE_PATTERN.test(code)) {
    return json({ error: "invalid_code" }, 400);
  }
  if (!SUBMITTABLE_CATEGORIES.includes(category)) {
    return json({ error: "invalid_category" }, 400);
  }
  if (!turnstileToken) {
    return json({ error: "missing_turnstile_token" }, 400);
  }

  const verified = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get("CF-Connecting-IP")
  );
  if (!verified) {
    return json({ error: "turnstile_failed" }, 403);
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

  const id = `user-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const crosshair = {
    id,
    name,
    code,
    category,
    proPlayerName: null,
    submittedBy: submittedBy || "匿名",
    tags,
    // 公開ギャラリーには承認後のみ表示される(モデレーション用)。
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const firestoreRes = await fetch(
    `${firestoreDocsUrl(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "/crosshairs")}?documentId=${encodeURIComponent(id)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: toFirestoreFields(crosshair) }),
    }
  );

  if (!firestoreRes.ok) {
    return json({ error: "firestore_write_failed" }, 502);
  }

  await recordHit(env.RATE_LIMIT_KV, ip, `submit:${ip}`, RATE_LIMIT_WINDOW_SECONDS);

  return json({
    ok: true,
    crosshair,
    message: "投稿を受け付けました。運営の確認後にギャラリーへ公開されます。",
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
