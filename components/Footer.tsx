import Link from "next/link";
import { DISCLAIMER_FOOTER, SITE_NAME } from "@/config/site";

const FOOTER_LINKS = [
  { href: "/about", label: "소개" },
  { href: "/guide", label: "가이드" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/disclaimer", label: "면책조항" },
  { href: "/contact", label: "문의" },
] as const;

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <nav aria-label="푸터 메뉴">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-slate-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-[11px] leading-relaxed text-slate-500">
          {DISCLAIMER_FOOTER}
        </p>
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} {SITE_NAME} 🐙
        </p>
      </div>
    </footer>
  );
}
