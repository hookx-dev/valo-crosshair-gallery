"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "ホーム" },
  { href: "/gallery", label: "ギャラリー" },
  { href: "/builder", label: "ビルダー" },
  { href: "/pro", label: "プロ設定" },
  { href: "/category", label: "カテゴリ" },
  { href: "/about", label: "このサイトについて" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 border-b border-valo-line/80 bg-valo-dark/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-4 w-4 -skew-x-12 bg-valo-red" />
          <span className="font-display text-lg font-bold tracking-wide text-white">
            VALO<span className="text-valo-red">/</span>CROSSHAIRS
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-valo-red" : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/submit"
            className="clip-corner-sm bg-valo-red px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-red-500"
          >
            投稿する
          </Link>
        </nav>

        <Link
          href="/submit"
          className="clip-corner-sm bg-valo-red px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-widest text-white sm:hidden"
        >
          投稿
        </Link>
      </div>
    </div>
  );
}
