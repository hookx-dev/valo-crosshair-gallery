import { beforeEach, describe, expect, it } from "vitest";
import { clientIp, isRateLimited, recordHit } from "./rateLimit";

// KVNamespaceの最小インメモリ実装(cf-types.d.tsで宣言されているget/put/deleteのみ)。
function createFakeKv(): KVNamespace {
  const store = new Map<string, string>();
  return {
    async get(key) {
      return store.get(key) ?? null;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
  };
}

describe("isRateLimited / recordHit", () => {
  let kv: KVNamespace;

  beforeEach(() => {
    kv = createFakeKv();
  });

  it("never limits when no KV namespace is bound", async () => {
    for (let i = 0; i < 10; i++) {
      await recordHit(undefined, "1.2.3.4", "k", 60);
    }
    expect(await isRateLimited(undefined, "1.2.3.4", "k", 1)).toBe(false);
  });

  it("never limits an unknown IP, even with a bound KV", async () => {
    for (let i = 0; i < 10; i++) {
      await recordHit(kv, "unknown", "k", 60);
    }
    expect(await isRateLimited(kv, "unknown", "k", 1)).toBe(false);
  });

  it("allows requests under the max and blocks at/after it", async () => {
    const ip = "1.2.3.4";
    const key = `submit:${ip}`;
    const max = 3;

    for (let i = 0; i < max; i++) {
      expect(await isRateLimited(kv, ip, key, max)).toBe(false);
      await recordHit(kv, ip, key, 60);
    }

    expect(await isRateLimited(kv, ip, key, max)).toBe(true);
  });

  it("keeps separate counters per key", async () => {
    await recordHit(kv, "1.2.3.4", "submit:1.2.3.4", 60);
    await recordHit(kv, "1.2.3.4", "submit:1.2.3.4", 60);
    expect(await isRateLimited(kv, "1.2.3.4", "admin-auth-fail:1.2.3.4", 1)).toBe(false);
  });
});

describe("clientIp", () => {
  it("reads CF-Connecting-IP", () => {
    const request = new Request("https://example.com", {
      headers: { "CF-Connecting-IP": "203.0.113.9" },
    });
    expect(clientIp(request)).toBe("203.0.113.9");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    const request = new Request("https://example.com");
    expect(clientIp(request)).toBe("unknown");
  });
});
