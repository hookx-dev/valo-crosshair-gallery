import type { Metadata } from "next";
import Link from "next/link";
import { HeroStats } from "@/components/home/HeroStats";
import { HeroPreviewCards } from "@/components/home/HeroPreviewCards";
import { CategorySamplePreview } from "@/components/home/CategorySamplePreview";

export const metadata: Metadata = {
  title: "VALO Crosshair Gallery | VALORANTのクロスヘア共有・検索サイト",
  description:
    "プロ選手・ネタ系・実用系のVALORANTクロスヘア設定を検索・共有できるギャラリーサイト。ワンクリックでインポートコードをコピーしてゲームにそのまま反映。Discord Botにも対応。",
};

const FEATURES = [
  {
    label: "SEARCH",
    title: "カテゴリ・検索ですぐ見つかる",
    desc: "プロ選手 / ネタ系 / 実用系のカテゴリと、名前・タグでの検索を組み合わせて、欲しいクロスヘアに一瞬でたどり着けます。",
  },
  {
    label: "COPY",
    title: "ワンクリックでコピー",
    desc: "インポートコードをコピーしてVALORANTの設定画面に貼り付けるだけ。面倒な手打ち設定は不要です。",
  },
  {
    label: "DISCORD",
    title: "Discord Botと連携",
    desc: "/crosshair random や /crosshair pro などのコマンドで、Discord上からも直接クロスヘアを取得できます。",
  },
  {
    label: "PRO GEAR",
    title: "プロの設定・使用デバイスも掲載",
    desc: "感度・DPIだけでなく、実際に使用しているマウスやモニターなどの機材情報までまとめて確認できます。",
  },
] as const;

const STEPS = [
  { no: "01", title: "探す", desc: "カテゴリやキーワードで好みのクロスヘアを探します。" },
  { no: "02", title: "コピー", desc: "気に入ったらインポートコードをワンクリックでコピー。" },
  { no: "03", title: "使う", desc: "ゲーム内の設定画面に貼り付ければ、すぐに反映されます。" },
] as const;

const CATEGORY_SHOWCASE = [
  { slug: "pro", label: "プロ選手", desc: "プロが実際に使うガチ設定" },
  { slug: "meme", label: "ネタ系", desc: "見て楽しい遊び心のある設定" },
  { slug: "practical", label: "実用系", desc: "視認性重視の実戦向け設定" },
] as const;

export default function LandingPage() {
  return (
    <div>
      {/* --- Hero --- */}
      <section className="relative overflow-hidden border-b border-valo-line/80">
        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 font-display text-sm font-semibold tracking-[0.3em] text-valo-red">
              VALORANT CROSSHAIR HUB
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.1] text-white sm:text-6xl">
              狙いを定める、<br />
              <span className="text-valo-red">その一秒</span>のために。
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
              プロ選手のガチ設定から遊び心のあるネタ系まで、VALORANTのクロスヘアを検索・共有できるギャラリーサイトです。
              気に入ったらワンクリックでコピーして、そのままゲームに反映できます。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/gallery"
                className="clip-corner-sm bg-valo-red px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500"
              >
                クロスヘアを探す →
              </Link>
              <Link
                href="/submit"
                className="clip-corner-sm border border-valo-line bg-valo-panel px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-valo-red hover:text-white"
              >
                自分のクロスヘアを投稿する
              </Link>
            </div>

            <HeroStats />
          </div>

          {/* --- サイトのプレビュー(ブラウザ風モックアップ) --- */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-valo-red/10 blur-3xl" />
            <div className="clip-corner -rotate-2 border border-valo-line bg-valo-panel2 shadow-2xl transition-transform duration-300 hover:rotate-0">
              <div className="flex items-center gap-1.5 border-b border-valo-line bg-valo-panel px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500/70" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                <span className="h-2 w-2 rounded-full bg-green-500/70" />
                <span className="ml-3 truncate font-mono text-[10px] text-gray-500">
                  valo-crosshairs.app/gallery
                </span>
              </div>
              <HeroPreviewCards />
            </div>
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-center gap-2">
          <span className="h-3 w-1 bg-valo-red" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            Why VALO Crosshair Gallery
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="clip-corner border border-valo-line bg-valo-panel p-6 transition-colors hover:border-valo-red/60"
            >
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-valo-red">
                {feature.label}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Category showcase --- */}
      <section className="border-y border-valo-line/80 bg-valo-panel2/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex items-center gap-2">
            <span className="h-3 w-1 bg-valo-red" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              Browse by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORY_SHOWCASE.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="clip-corner group flex flex-col items-center gap-4 border border-valo-line bg-valo-panel p-8 text-center transition-colors hover:border-valo-red/60"
              >
                <CategorySamplePreview category={cat.slug} />
                <div>
                  <h3 className="font-display text-lg font-semibold text-white group-hover:underline">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- How it works --- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-center gap-2">
          <span className="h-3 w-1 bg-valo-red" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.no} className="flex flex-col gap-2">
              <span className="font-display text-4xl font-bold text-valo-line">{step.no}</span>
              <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="border-t border-valo-line/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            次に使うクロスヘア、もう決まりましたか？
          </h2>
          <p className="max-w-md text-sm text-gray-400">
            ギャラリーを見て、気に入った設定をそのままコピー。1分あれば試せます。
          </p>
          <Link
            href="/gallery"
            className="clip-corner-sm mt-2 bg-valo-red px-8 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500"
          >
            クロスヘアを探す →
          </Link>
        </div>
      </section>
    </div>
  );
}
