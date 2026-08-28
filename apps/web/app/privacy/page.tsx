import type { Metadata } from "next";

export const metadata: Metadata = { title: "プライバシーポリシー | VALO Crosshair Gallery" };

const SECTIONS = [
  {
    title: "運営者情報",
    body: "本サイト「VALO Crosshair Gallery」（以下「当サイト」）は、Hookx Dev（以下「当方」）が運営しています。",
  },
  {
    title: "個人情報の収集について",
    body: "お問い合わせフォーム等を通じてご提供いただく氏名・メールアドレス等は、お問い合わせへの対応の目的以外には利用しません。",
  },
  {
    title: "アクセス解析ツールについて",
    body: "当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用する場合があります。Googleアナリティクスはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。",
  },
  {
    title: "広告配信について",
    body: "当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する場合があります。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。",
  },
  {
    title: "アフィリエイトプログラムについて",
    body: "当サイトは、Amazonアソシエイト・プログラムをはじめとするアフィリエイトプログラムに参加しています。詳細は「アフィリエイト表記」ページをご確認ください。",
  },
  {
    title: "免責事項",
    body: "当サイトに掲載する情報については、その正確性・安全性を保証するものではありません。当サイトの利用によって生じた損害について、当方は一切の責任を負いません。",
  },
  {
    title: "プライバシーポリシーの変更",
    body: "当サイトは、必要に応じて本ポリシーの内容を変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じるものとします。",
  },
  {
    title: "お問い合わせ",
    body: "本ポリシーに関するお問い合わせは、このサイトについてページに記載の連絡先までご連絡ください。",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">プライバシーポリシー</h1>
      <div className="mt-8 flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-valo-red">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
