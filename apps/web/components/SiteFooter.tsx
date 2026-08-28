import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "このサイトについて" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/disclosure", label: "アフィリエイト表記" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-valo-line/80 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6">
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
