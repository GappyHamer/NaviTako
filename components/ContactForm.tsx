"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "sending" | "success" | "error";

const INPUT_CLASS =
  "surface-solid border-app txt border rounded-xl px-3 py-2 w-full text-sm";

export default function ContactForm() {
  const t = useTranslations("pages");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // 허니팟
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<"disabled" | "other">("other");

  const canSubmit = message.trim() !== "" && status !== "sending";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message, website }),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      setErrorKind(res.status === 503 ? "disabled" : "other");
      setStatus("error");
    } catch {
      setErrorKind("other");
      setStatus("error");
    }
  }

  function resetForm() {
    setName("");
    setContact("");
    setMessage("");
    setWebsite("");
    setErrorKind("other");
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div className="surface rounded-2xl p-6 text-center space-y-4">
        <p className="txt-strong text-sm">{t("contact.formSuccess")}</p>
        <button type="button" onClick={resetForm} className="btn-accent">
          {t("contact.formNew")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-2xl p-6 space-y-4">
      {/* 허니팟 (사람 눈에 안 보임) */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="space-y-1.5">
        <label htmlFor="contact-name" className="txt-muted text-sm block">
          {t("contact.labelName")}{" "}
          <span className="txt-faint">{t("contact.optional")}</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoComplete="off"
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-contact" className="txt-muted text-sm block">
          {t("contact.labelContact")}{" "}
          <span className="txt-faint">{t("contact.optional")}</span>
        </label>
        <input
          id="contact-contact"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={120}
          autoComplete="off"
          placeholder={t("contact.contactPlaceholder")}
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="txt-muted text-sm block">
          {t("contact.labelMessage")}
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={5}
          className={INPUT_CLASS}
        />
      </div>

      <button type="submit" disabled={!canSubmit} className="btn-accent">
        {status === "sending" ? t("contact.sending") : t("contact.send")}
      </button>

      {status === "error" && (
        <p className="txt-short text-sm">
          {errorKind === "disabled"
            ? t("contact.errDisabled")
            : t("contact.errOther")}
        </p>
      )}
    </form>
  );
}
