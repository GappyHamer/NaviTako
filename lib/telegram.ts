import { SITE_NAME } from "@/config/site";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CONTACT_CHAT_ID ?? "";

export const contactBotEnabled = Boolean(TOKEN && CHAT_ID);

export type SendResult = { ok: boolean; reason?: "disabled" | "invalid" | "send_fail" };

export async function sendContactMessage(input: {
  name?: string;
  contact?: string;
  message: string;
}): Promise<SendResult> {
  if (!contactBotEnabled) return { ok: false, reason: "disabled" };
  const message = (input.message ?? "").trim();
  if (message.length < 1 || message.length > 2000) return { ok: false, reason: "invalid" };
  const name = ((input.name ?? "").trim().slice(0, 60)) || "-";
  const contact = ((input.contact ?? "").trim().slice(0, 120)) || "-";
  const text = `📮 새 문의 · ${SITE_NAME}\n\n이름: ${name}\n연락처: ${contact}\n\n${message.slice(0, 2000)}`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, reason: "send_fail" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "send_fail" };
  }
}
