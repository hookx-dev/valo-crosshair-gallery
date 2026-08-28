import Link from "next/link";
import { BUY_ME_A_COFFEE_URL } from "@/lib/supportLinks";

const FOOTER_LINKS = [
  { href: "/about", label: "このサイトについて" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/disclosure", label: "アフィリエイト表記" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-valo-line/80 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6">
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="clip-corner-sm bg-yellow-500 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-valo-dark transition-colors hover:bg-yellow-400"
        >
          ☕ Buy Me a Coffee で応援する
        </a>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-xs text-gray-500 hover:text-gray-300">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-gray-600">Hookx Dev — VALO Crosshair Gallery MVP</p>
      </div>
    </footer>
  );
}
