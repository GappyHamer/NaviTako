/**
 * 익명 사용자 정체성 (클라이언트 전용).
 * userId 는 localStorage 에 저장되는 UUID. 나중에 구글 로그인을 붙이면
 * 이 userId 에 계정을 연결(또는 로그인 계정의 id로 승격)하는 식으로 확장한다.
 * 닉네임은 표시용이며 고유하지 않다(순위는 userId 기준).
 */

const UID_KEY = "tako:uid";
const NICK_KEY = "tako:nick";

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(UID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(UID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function getNick(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(NICK_KEY);
  } catch {
    return null;
  }
}

export function setNick(nick: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NICK_KEY, nick);
  } catch {
    // 무시
  }
}
