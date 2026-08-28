import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "アフィリエイト表記 | VALO Crosshair Gallery",
  description: "VALO Crosshair Galleryが参加しているアフィリエイトプログラムについて。",
  path: "/disclosure",
});

export default function DisclosurePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">アフィリエイト表記</h1>
      <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-gray-400">
        <p>
          当サイト「VALO Crosshair Gallery」は、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
        </p>
        <p>
          当サイトは、Amazonアソシエイト・プログラムをはじめとする各種アフィリエイトプログラムに参加しています。
        </p>
        <p>
          プロ選手の設定・デバイス紹介ページなど、当サイト内の商品紹介リンクにはアフィリエイトリンクが含まれます。
          ユーザーが当該リンク経由で商品を購入された場合、当サイトが各サービス提供事業者から紹介料を受け取ることがあります。
        </p>
        <p>
          紹介料の有無に関わらず、当サイトは実際の使用感や公開情報に基づいた紹介を行うよう努めています。
          表示している商品名・価格・在庫状況等は変更される場合がありますので、購入前に必ずリンク先の販売ページでご確認ください。
        </p>
      </div>
    </main>
  );
}
