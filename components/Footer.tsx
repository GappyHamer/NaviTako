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
    <footer className="border-app mt-16 border-t px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <nav aria-label="푸터 메뉴">
          <ul className="txt-muted flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:opacity-80">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="txt-faint text-[11px] leading-relaxed">
          {DISCLAIMER_FOOTER}
        </p>
        <p className="txt-faint text-[11px]">
          © {new Date().getFullYear()} {SITE_NAME}{" "}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/octopus.png"
            alt="타코쨩"
            width={16}
            height={16}
            className="inline-block h-4 w-4 align-text-bottom"
          />
        </p>
      </div>
    </footer>
  );
}
