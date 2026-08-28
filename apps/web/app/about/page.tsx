import type { Metadata } from "next";

export const metadata: Metadata = { title: "このサイトについて | VALO Crosshair Gallery" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">このサイトについて</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-gray-400">
        <p>
          VALO Crosshair Galleryは、VALORANTのクロスヘア設定を検索・共有できる非公式のファンサイトです。
          プロ選手のクロスヘアやおすすめのネタ系・実用系クロスヘアを掲載し、Discord Botと連携してゲーム内にすぐ反映できるインポートコードを提供しています。
        </p>
        <p>
          本サイトはRiot Games, Inc.およびVALORANT公式とは一切関係のない非公式のファンコンテンツです。
          VALORANTおよび関連する商標はRiot Games, Inc.に帰属します。
        </p>
        <p>
          運営: Hookx Dev
          <br />
          お問い合わせ: contact@example.com（準備中）
        </p>
      </div>
    </main>
  );
}
