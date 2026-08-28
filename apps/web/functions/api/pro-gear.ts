import { proGearProfiles } from "@/data/pro-gear";

// 感度・デバイス情報は非公開データを含まないため認証不要の公開エンドポイントとする(Botから参照する用途)。
export async function onRequestGet(): Promise<Response> {
  return new Response(JSON.stringify(proGearProfiles), {
    headers: { "Content-Type": "application/json" },
  });
}
