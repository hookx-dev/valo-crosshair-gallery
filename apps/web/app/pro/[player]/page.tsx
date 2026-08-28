import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { mockProGear } from "@/data/mock-pro-gear";
import { mockCrosshairs } from "@/data/mock-crosshairs";
import { CrosshairPreview } from "@/components/CrosshairPreview";
import { CopyCodeButton } from "@/components/CopyCodeButton";

export function generateStaticParams() {
  return mockProGear.map((profile) => ({ player: profile.slug }));
}

export function generateMetadata({ params }: { params: { player: string } }): Metadata {
  const profile = mockProGear.find((p) => p.slug === params.player);
  if (!profile) return {};
  return {
    title: `${profile.playerName}の設定・使用デバイス | VALO Crosshair Gallery`,
    description: `${profile.playerName}選手のクロスヘア設定と使用デバイス一覧。`,
  };
}

export default function ProDetailPage({ params }: { params: { player: string } }) {
  const profile = mockProGear.find((p) => p.slug === params.player);
  if (!profile) notFound();
  const crosshair = mockCrosshairs.find((c) => c.id === profile.crosshairId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/pro" className="text-xs text-gray-500 hover:text-gray-300">
        ← プロ選手一覧に戻る
      </Link>

      <div className="mt-6 flex items-center gap-4">
        {crosshair && <CrosshairPreview code={crosshair.code} className="h-40 w-40 shrink-0" zoom={1.8} />}
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-valo-red">
            {profile.team}
          </p>
          <h1 className="font-display text-3xl font-bold text-white">{profile.playerName}</h1>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-6 border-y border-valo-line/60 py-4">
        <div>
          <span className="font-display text-xl font-bold text-white">{profile.sensitivity}</span>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Sensitivity</p>
        </div>
        <div>
          <span className="font-display text-xl font-bold text-white">{profile.dpi}</span>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">DPI</p>
        </div>
      </div>

      {crosshair && (
        <div className="mt-6">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-gray-500">
            Crosshair Code
          </p>
          <code className="clip-corner-sm mt-2 block break-all border border-valo-line bg-valo-panel2 px-4 py-3 font-mono text-sm text-gray-300">
            {crosshair.code}
          </code>
          <CopyCodeButton code={crosshair.code} className="mt-3 w-fit" />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-3 w-1 bg-valo-red" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            使用デバイス
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {profile.gear.map((item) => (
            <div
              key={item.name}
              className="clip-corner flex items-center justify-between gap-3 border border-valo-line bg-valo-panel p-4"
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">{item.category}</p>
                <p className="truncate font-display text-sm font-semibold text-white">{item.name}</p>
              </div>
              <a
                href={item.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="clip-corner-sm shrink-0 border border-valo-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-valo-red hover:text-white"
              >
                詳細を見る
              </a>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-gray-600">
          ※ PR / このページのリンクにはアフィリエイトプログラムを利用しているものが含まれます。
          <Link href="/disclosure" className="ml-1 underline hover:text-gray-400">
            詳細
          </Link>
        </p>
      </div>
    </main>
  );
}
