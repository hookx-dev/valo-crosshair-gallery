import Link from "next/link";
import type { Metadata } from "next";
import { mockProGear } from "@/data/mock-pro-gear";
import { mockCrosshairs } from "@/data/mock-crosshairs";
import { CrosshairPreview } from "@/components/CrosshairPreview";

export const metadata: Metadata = { title: "プロ選手の設定・デバイス一覧 | VALO Crosshair Gallery" };

export default function ProListPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">PRO SETTINGS</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">プロ選手の設定・使用デバイス</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-400">
        感度・DPI・クロスヘアに加えて、実際に使用しているマウスやモニターなどのギア情報をまとめています。
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mockProGear.map((profile) => {
          const crosshair = mockCrosshairs.find((c) => c.id === profile.crosshairId);
          return (
            <Link
              key={profile.slug}
              href={`/pro/${profile.slug}`}
              className="clip-corner flex items-center gap-4 border border-valo-line bg-valo-panel p-4 transition-colors hover:border-valo-red/60"
            >
              {crosshair && <CrosshairPreview code={crosshair.code} />}
              <div>
                <h2 className="font-display text-lg font-semibold text-white">{profile.playerName}</h2>
                <p className="text-xs text-gray-500">
                  {profile.team} ・ {profile.role}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  DPI {profile.dpi} / 感度 {profile.sensitivity}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-[11px] text-gray-600">
        ※ PR / このページの一部リンクはアフィリエイトプログラムを利用しています。
        <Link href="/disclosure" className="ml-1 underline hover:text-gray-400">
          詳細
        </Link>
      </p>
    </main>
  );
}
