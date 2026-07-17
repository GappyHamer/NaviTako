import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SocialLinks from "@/components/SocialLinks";
import { SITE_NAME } from "@/config/site";

const FOOTER_LINKS = [
  { href: "/about", key: "about" },
  { href: "/guide", key: "guide" },
  { href: "/privacy", key: "privacy" },
  { href: "/disclaimer", key: "disclaimer" },
  { href: "/contact", key: "contact" },
] as const;

export default function Footer() {
  const t = useTranslations("footer");
  const td = useTranslations("disclaimer");

  return (
    <footer className="border-app mt-16 border-t px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <SocialLinks />
        <nav aria-label="푸터 메뉴">
          <ul className="txt-muted flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:opacity-80">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="txt-faint text-[11px] leading-relaxed">
          {td("footer")}
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
