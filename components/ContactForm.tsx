"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const INPUT_CLASS =
  "surface-solid border-app txt border rounded-xl px-3 py-2 w-full text-sm";

export default function ContactForm() {
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
        <p className="txt-strong text-sm">
          ✅ 문의가 접수됐어요. 확인 후 회신드릴게요.
        </p>
        <button type="button" onClick={resetForm} className="btn-accent">
          새 문의 작성
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
          이름 <span className="txt-faint">(선택)</span>
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
          연락처 <span className="txt-faint">(선택)</span>
        </label>
        <input
          id="contact-contact"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={120}
          autoComplete="off"
          placeholder="회신받을 이메일 또는 텔레그램 @아이디"
          className={INPUT_CLASS}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="txt-muted text-sm block">
          문의 내용
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
        {status === "sending" ? "보내는 중…" : "문의 보내기"}
      </button>

      {status === "error" && (
        <p className="txt-short text-sm">
          {errorKind === "disabled"
            ? "지금은 문의 접수가 잠시 어려워요. 잠시 후 다시 시도해 주세요."
            : "전송에 실패했어요. 잠시 후 다시 시도해 주세요."}
        </p>
      )}
    </form>
  );
}
