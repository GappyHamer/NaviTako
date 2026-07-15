import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/config/site";

const ICONS: Record<(typeof SOCIAL_LINKS)[number]["type"], ReactNode> = {
  telegram: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path
        fill="#fff"
        d="M17.5 7.2 5.9 11.6c-.8.3-.8.8-.1 1l3 .9 1.1 3.6c.2.4.1.5.5.5.3 0 .4-.1.6-.3l1.5-1.4 3 2.2c.5.3.9.1 1-.5l1.8-8.4c.1-.5-.2-.8-.7-.6z"
      />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#000" />
      <path
        fill="#fff"
        d="M14.9 6.5h1.8l-3.9 4.5 4.6 6.1h-3.6l-2.8-3.7-3.2 3.7H4l4.2-4.8L3.8 6.5h3.7l2.5 3.4 3-3.4zm-.6 9.5h1L8.8 7.5h-1l6.5 8.5z"
      />
    </svg>
  ),
};

export default function SocialLinks() {
  return (
    <div className="surface mx-auto w-full max-w-sm rounded-2xl p-5 text-left">
      <p className="txt-muted mb-3 text-sm font-semibold">Social Media</p>
      <ul className="space-y-1">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:opacity-80"
            >
              {ICONS[link.type]}
              <span className="txt-strong flex-1 truncate text-sm font-medium">
                {link.name}
              </span>
              {link.isNew && (
                <span
                  className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    borderColor: "var(--accent)",
                    color: "var(--accent-strong)",
                  }}
                >
                  NEW
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
