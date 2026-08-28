"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CrosshairCard } from "@/components/CrosshairCard";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import type { Crosshair } from "@/types";

// 「プロ選手」カテゴリは実在の選手への誤帰属を避けるため、投稿対象から除外している。
const SUBMITTABLE_CATEGORIES: { value: "meme" | "practical"; label: string }[] = [
  { value: "meme", label: "ネタ系" },
  { value: "practical", label: "実用系" },
];

const CODE_PATTERN = /^0;.{5,200}$/;

export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <SubmitForm />
    </Suspense>
  );
}

function SubmitForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [category, setCategory] = useState<"meme" | "practical">("practical");
  const [tagsInput, setTagsInput] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Crosshair | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 1 || name.trim().length > 40) {
      setError("クロスヘア名は1〜40文字で入力してください。");
      return;
    }
    if (!CODE_PATTERN.test(code.trim())) {
      setError("クロスヘアコードの形式が正しくありません（例: 0;P;c;1;h;0;...）。");
      return;
    }
    if (!turnstileToken) {
      setError("ボットではないことの確認にチェックを入れてください。");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 5);

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          category,
          submittedBy: authorName.trim(),
          tags,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("投稿に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      setSubmitted(data.crosshair as Crosshair);
      setName("");
      setCode("");
      setTagsInput("");
    } catch {
      setError("通信に失敗しました。ネットワーク環境を確認して再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-valo-red">SUBMIT</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">クロスヘアを投稿する</h1>
      <p className="mt-2 text-sm text-gray-400">
        あなたのお気に入りのクロスヘア設定をシェアしましょう。投稿は即時公開されますが、内容によっては後から削除されることがあります。
        プロ選手のクロスヘアとしての投稿は現在受け付けていません。
      </p>

      <Link
        href="/builder"
        className="mt-4 inline-block text-xs text-gray-500 underline hover:text-gray-300"
      >
        コードを持っていない場合はビルダーで作成する →
      </Link>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
            クロスヘア名
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="例: 高視認性グリーンドット"
            className="clip-corner-sm w-full border border-valo-line bg-valo-panel px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-valo-red"
          />
        </div>

        <div>
          <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
            投稿者名（任意）
          </label>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={20}
            placeholder="未入力の場合は「匿名」で表示されます"
            className="clip-corner-sm w-full border border-valo-line bg-valo-panel px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-valo-red"
          />
        </div>

        <div>
          <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
            インポートコード
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="0;P;c;1;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0"
            className="clip-corner-sm w-full border border-valo-line bg-valo-panel2 px-3 py-2 font-mono text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-valo-red"
          />
        </div>

        <div>
          <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
            カテゴリ
          </label>
          <div className="flex gap-2">
            {SUBMITTABLE_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`clip-corner-sm px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                  category === c.value
                    ? "bg-valo-red text-white"
                    : "border border-valo-line bg-valo-panel text-gray-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
            タグ（カンマ区切り・最大5個）
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="green, dot, small"
            className="clip-corner-sm w-full border border-valo-line bg-valo-panel px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-valo-red"
          />
        </div>

        <div>
          <label className="mb-2 block font-display text-xs font-semibold uppercase tracking-wide text-gray-400">
            ボット確認
          </label>
          <TurnstileWidget onVerify={setTurnstileToken} />
        </div>

        {error && <p className="text-sm text-valo-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="clip-corner-sm w-fit bg-valo-red px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          {submitting ? "投稿中..." : "投稿する"}
        </button>
      </form>

      {submitted && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-1 bg-valo-red" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
              投稿を受け付けました
            </h2>
          </div>
          <CrosshairCard crosshair={submitted} />
        </div>
      )}

      <p className="mt-10 text-[11px] text-gray-600">
        投稿はサーバー側でも再検証されたうえで即時公開されます。不適切な投稿は事後に削除される場合があります。詳しくは
        <Link href="/privacy" className="mx-1 underline hover:text-gray-400">
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>
    </main>
  );
}
