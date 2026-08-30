"use client";

import { useEffect, useState } from "react";
import { CrosshairPreview } from "@/components/CrosshairPreview";
import type { Crosshair } from "@/types";

const SECRET_STORAGE_KEY = "admin_secret";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pending, setPending] = useState<Crosshair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SECRET_STORAGE_KEY);
    if (saved) {
      setSecret(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) void loadPending(secret);
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPending(currentSecret: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pending", {
        headers: { "x-admin-secret": currentSecret },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem(SECRET_STORAGE_KEY);
        setError("シークレットが正しくありません。");
        return;
      }
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { crosshairs: Crosshair[] };
      setPending(data.crosshairs);
    } catch {
      setError("読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    sessionStorage.setItem(SECRET_STORAGE_KEY, secret);
    setAuthed(true);
  }

  async function moderate(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("failed");
      setPending((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("操作に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setBusyId(null);
    }
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-display text-xl font-bold text-white">管理ページ</h1>
        <p className="mt-2 text-sm text-gray-400">ADMIN_SECRETを入力してください。</p>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="mt-4 w-full border border-valo-line bg-valo-panel px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-valo-red"
          placeholder="secret"
        />
        <button
          onClick={handleLogin}
          className="mt-3 w-full bg-valo-red px-3 py-2 text-sm font-semibold text-white"
        >
          ログイン
        </button>
        {error && <p className="mt-2 text-sm text-valo-red">{error}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-white">承認待ちの投稿({pending.length}件)</h1>
        <button
          onClick={() => loadPending(secret)}
          className="border border-valo-line px-3 py-1.5 text-xs text-gray-300 hover:text-white"
        >
          再読み込み
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-valo-red">{error}</p>}
      {loading && <p className="mt-4 text-sm text-gray-500">読み込み中...</p>}

      {!loading && pending.length === 0 && !error && (
        <p className="mt-8 text-sm text-gray-500">承認待ちの投稿はありません。</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {pending.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 border border-valo-line bg-valo-panel p-4"
          >
            <CrosshairPreview code={c.code} className="h-20 w-20 shrink-0" label={c.name} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{c.name}</p>
              <p className="truncate text-xs text-gray-400">{c.code}</p>
              <p className="mt-1 text-xs text-gray-500">
                by {c.submittedBy ?? "匿名"} / {c.category} / {c.tags.join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                disabled={busyId === c.id}
                onClick={() => moderate(c.id, "approve")}
                className="bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                承認
              </button>
              <button
                disabled={busyId === c.id}
                onClick={() => moderate(c.id, "reject")}
                className="bg-valo-red px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                却下
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
