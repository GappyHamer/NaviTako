/**
 * OG 이미지(satori)용 한글 폰트 로더.
 * Google Fonts CSS API에서 필요한 글자만 서브셋으로 받아온다 (API 키 불필요).
 * 실패하면 null을 반환하고, 호출부는 영문 전용 디자인으로 폴백한다.
 */

const TIMEOUT_MS = 3000;

export async function loadNotoSansKR(
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`;
    const cssRes = await fetch(cssUrl, {
      // 구형 UA로 요청하면 woff2 대신 satori가 읽을 수 있는 TTF/woff URL을 준다
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; rv:22.0) Gecko/20130405 Firefox/22.0",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();

    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:woff|truetype|opentype)['"]?\)/);
    if (!match) return null;

    const fontRes = await fetch(match[1], {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}
