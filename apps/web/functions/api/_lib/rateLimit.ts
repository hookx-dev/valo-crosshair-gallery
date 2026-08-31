// IPアドレス単位のシンプルなカウンタ式レート制限。RATE_LIMIT_KVが未設定の環境では
// 制限なしで動作する(スパム対策は必須ではなく多層防御の一つのため)。
// KVの読み取り→書き込みはアトミックではないため厳密な制限ではないが、
// ブルートフォースや連打の抑止としては十分。

// IPが取得できない(ローカル開発など、Cloudflareのエッジを経由しない)場合は
// 単一キーに全リクエストが積み上がってしまうため、制限自体をスキップする。
export async function isRateLimited(
  kv: KVNamespace | undefined,
  ip: string,
  key: string,
  max: number
): Promise<boolean> {
  if (!kv || ip === "unknown") return false;
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  return count >= max;
}

export async function recordHit(
  kv: KVNamespace | undefined,
  ip: string,
  key: string,
  windowSeconds: number
): Promise<void> {
  if (!kv || ip === "unknown") return;
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
}

export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}
