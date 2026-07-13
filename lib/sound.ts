"use client";

type SoundName = "click" | "summon" | "reveal";

// 추후 여기에 "/sounds/xxx.mp3" 경로만 넣으면 자동 재생됨 (지금은 비어 무음)
const SOURCES: Partial<Record<SoundName, string>> = {};

let enabled = true;
const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || !enabled) return;
  const src = SOURCES[name];
  if (!src) return; // 파일 없으면 조용히 무음 (에러 없음)
  try {
    let a = cache[name];
    if (!a) {
      a = new Audio(src);
      cache[name] = a;
    }
    a.currentTime = 0;
    void a.play().catch(() => {});
  } catch {
    /* 무시 */
  }
}
