// Firestore REST APIをAdmin権限(サービスアカウント)で叩くための共通処理。
// Cloudflare Pages Functionsのランタイム(Workers)はfirebase-admin SDKを使えないため、
// OAuth2 JWTベアラーフローを自前実装している。

export interface ServiceAccountCreds {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export async function getGoogleAccessToken(creds: ServiceAccountCreds): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: cleanEnvValue(creds.clientEmail),
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const claimB64 = base64url(encoder.encode(JSON.stringify(claim)));
  const unsigned = `${headerB64}.${claimB64}`;

  const key = await importPrivateKey(creds.privateKey);
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

export function firestoreDocsUrl(projectId: string, path = ""): string {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents${path}`;
}

export function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

export function toFirestoreValue(value: unknown): unknown {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { doubleValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  throw new Error("Unsupported Firestore value type");
}

export function fromFirestoreFields(fields: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    result[key] = fromFirestoreValue(value);
  }
  return result;
}

function fromFirestoreValue(value: unknown): unknown {
  const v = value as Record<string, unknown>;
  if ("nullValue" in v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("doubleValue" in v) return v.doubleValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("arrayValue" in v) {
    const arr = (v.arrayValue as { values?: unknown[] }).values ?? [];
    return arr.map(fromFirestoreValue);
  }
  return null;
}

// サービスアカウントJSONの値をそのまま(末尾のカンマや前後の引用符ごと)貼り付けても
// 動くように、Cloudflareの環境変数値からPEM本体を安全に取り出す。
function cleanEnvValue(raw: string): string {
  let s = raw.trim();
  s = s.replace(/,\s*$/, ""); // JSONフィールドをそのままコピーした場合の末尾カンマ
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of buf) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const trimmed = cleanEnvValue(pem);
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

export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}
