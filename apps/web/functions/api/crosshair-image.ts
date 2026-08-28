import { Resvg, initWasm } from "@resvg/resvg-wasm";
// Cloudflareのバンドラーは.wasmインポートをWebAssembly.Moduleとして解決する。
// @ts-expect-error -- .wasmの型定義は無いが、Cloudflare Pages Functionsのビルドで解決される
import wasmModule from "@resvg/resvg-wasm/index_bg.wasm";
import { buildCrosshairSvg } from "@/lib/crosshairSvg";

let wasmReady: Promise<void> | null = null;
function ensureWasmInit(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(wasmModule);
  }
  return wasmReady;
}

const CODE_PATTERN = /^0;.{5,200}$/;

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code") ?? "";

  if (!CODE_PATTERN.test(code)) {
    return new Response("invalid code", { status: 400 });
  }

  try {
    await ensureWasmInit();
    const svg = buildCrosshairSvg(code, { zoom: 2.6 });
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
