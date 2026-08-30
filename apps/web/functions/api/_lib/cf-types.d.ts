// Cloudflare Pages Functionsのランタイム型を最小限だけ宣言する。
// @cloudflare/workers-types 一式を入れるほどの利用範囲ではないため、
// 実際に使っているKVNamespaceのAPIだけを手書きしている。
export {};

declare global {
  interface KVNamespace {
    get(key: string, options?: { type?: "text" }): Promise<string | null>;
    put(
      key: string,
      value: string,
      options?: { expirationTtl?: number }
    ): Promise<void>;
    delete(key: string): Promise<void>;
  }
}
