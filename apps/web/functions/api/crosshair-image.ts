import { Resvg, initWasm } from "@resvg/resvg-wasm";
// Cloudflareのバンドラーは.wasmインポートをWebAssembly.Moduleとして解決する。
// @ts-expect-error -- .wasmの型定義は無いが、Cloudflare Pages Functionsのビルドで解決される
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import { buildCrosshairSvg } from "@/lib/crosshairSvg";
import { clientIp, isRateLimited, recordHit } from "./_lib/rateLimit";

interface Env {
  // 未バインドでも動作するようにoptional扱いにする(WASMレンダリングの濫用対策)。
  RATE_LIMIT_KV?: KVNamespace;
}

let wasmReady: Promise<void> | null = null;
function ensureWasmInit(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(wasmModule);
  }
  return wasmReady;
}

const CODE_PATTERN = /^0;.{5,200}$/;

// 1リクエストごとにWASMでのPNGレンダリングが走る(CPU課金対象)ため、
// 1つのIPから許容する回数をウィンドウ内で制限する。KV未設定時はスキップされる。
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1時間

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";

  if (!CODE_PATTERN.test(code)) {
    return new Response("invalid code", { status: 400 });
  }

  const ip = clientIp(request);
  if (await isRateLimited(env.RATE_LIMIT_KV, ip, `crosshair-image:${ip}`, RATE_LIMIT_MAX)) {
    return new Response("rate limited", { status: 429 });
  }
  await recordHit(env.RATE_LIMIT_KV, ip, `crosshair-image:${ip}`, RATE_LIMIT_WINDOW_SECONDS);

  try {
    await ensureWasmInit();
    const svg = buildCrosshairSvg(code);
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 512 } });
    const png = new Uint8Array(resvg.render().asPng());

    return new Response(new Blob([png]), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("failed to render image", { status: 500 });
  }
}
