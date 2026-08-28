interface Env {
  TURNSTILE_SECRET_KEY: string;
  // ブラウザ用のビルド時設定(NEXT_PUBLIC_FIREBASE_*)を流用し、
  // サーバー専用シークレットとして新規追加するのはCLIENT_EMAIL/PRIVATE_KEYのみにする。
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
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

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

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
    accessToken = await getGoogleAccessToken(env);
  } catch (err) {
    // TODO: 動作確認用に詳細を返している。原因特定後は詳細を消して "auth_failed" のみ返す。
    const raw = env.FIREBASE_PRIVATE_KEY ?? "";
    return json(
      {
        error: "auth_failed",
        detail: err instanceof Error ? err.message : String(err),
        keyInfo: {
          length: raw.length,
          startsWithQuote: raw.trim().startsWith('"'),
          startsWithBegin: raw.includes("-----BEGIN PRIVATE KEY-----"),
          hasLiteralBackslashN: raw.includes("\\n"),
          hasRealNewline: raw.includes("\n"),
          head: raw.slice(0, 15),
          tail: raw.slice(-15),
        },
      },
      500
    );
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
    imageUrl: "",
    createdAt: new Date().toISOString(),
  };

  const firestoreRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/crosshairs?documentId=${encodeURIComponent(
      id
    )}`,
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

  return json({ ok: true, crosshair });
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

// --- Firestore REST field encoding ---
function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

function toFirestoreValue(value: unknown): unknown {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { doubleValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  throw new Error("Unsupported Firestore value type");
}

// --- Google service-account JWT bearer flow (Workers-runtime compatible, no SDK) ---
async function getGoogleAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const claimB64 = base64url(encoder.encode(JSON.stringify(claim)));
  const unsigned = `${headerB64}.${claimB64}`;

  const key = await importPrivateKey(env.FIREBASE_PRIVATE_KEY);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsigned));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });

  if (!res.ok) {
    throw new Error(`OAuth token exchange failed: ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of buf) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const trimmed = pem.trim().replace(/^"(.*)"$/, "$1");
  const normalized = trimmed.replace(/\\n/g, "\n");
  const pemContents = normalized
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  if (!pemContents) {
    throw new Error("FIREBASE_PRIVATE_KEY is empty or malformed");
  }
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
