/**
 * 예언 결과 키워드 풀 (문장 대신 세 단어: "주체, 분위기, 대상").
 * 예: "일론, 강세, 도지"
 *
 * 세 분류에서 하나씩 뽑는다. 분위기는 롱/숏에 맞춰 상승/하락 풀에서 고른다.
 * 대상(코인)은 시드 + 매주 자동 추가분(CoinGecko 트렌딩)이 합쳐진다(/api/keywords).
 * 기존 단어는 계속 유지하고 시드에 새 단어를 추가하는 식으로 관리한다.
 */

export type KeywordPools = {
  subjects: string[];
  sentimentLong: string[];
  sentimentShort: string[];
  targets: string[];
};

/** 주체 (누가/무엇이) — 롱숏 중립 */
export const SUBJECTS: string[] = [
  "일론",
  "고래",
  "기관",
  "개미",
  "세력",
  "연준",
  "파월",
  "나스닥",
  "김프",
  "사토시",
  "트럼프",
  "ETF",
  "서학개미",
  "선물창",
  "미국장",
  "채굴자",
  "스마트머니",
  "온체인",
  "커뮤니티",
  "트위터",
];

/** 분위기 — 상승(롱) */
export const SENTIMENT_LONG: string[] = [
  "강세",
  "떡상",
  "불장",
  "가즈아",
  "돌파",
  "신고가",
  "반등",
  "숏청산",
  "매집",
  "존버승리",
  "로켓",
  "우상향",
  "골든크로스",
  "패닉바잉",
  "환희",
];

/** 분위기 — 하락(숏) */
export const SENTIMENT_SHORT: string[] = [
  "약세",
  "떡락",
  "곰장",
  "조정",
  "패닉",
  "공포",
  "청산",
  "눌림",
  "손절",
  "데드캣",
  "우하향",
  "데드크로스",
  "투매",
  "물림",
  "멘붕",
];

/** 대상(코인) — 시드. 매주 CoinGecko 트렌딩이 여기에 합쳐진다 */
export const TARGETS: string[] = [
  "비트",
  "이더",
  "도지",
  "리플",
  "솔라나",
  "시바",
  "페페",
  "에이다",
  "트론",
  "봉크",
  "폴카닷",
  "아발란체",
  "체인링크",
  "라이트코인",
  "니어",
  "앱토스",
  "수이",
  "밈코인",
  "알트",
  "김치코인",
];

export const SEED_POOLS: KeywordPools = {
  subjects: SUBJECTS,
  sentimentLong: SENTIMENT_LONG,
  sentimentShort: SENTIMENT_SHORT,
  targets: TARGETS,
};

/**
 * 세 키워드 문구 생성. 예: "도지, 고래, 떡락".
 * 카테고리(주체/분위기/대상) 구분 없이 전체 단어를 한 풀로 합쳐, 방향과 무관하게
 * 서로 다른 3개를 완전 무작위로 뽑는다. rng 주입으로 테스트 가능.
 */
export function makeKeywordPhrase(
  side: "LONG" | "SHORT",
  pools: KeywordPools = SEED_POOLS,
  rng: () => number = Math.random
): string {
  void side; // 롱/숏 방향과 무관하게 무작위

  const merged = [
    ...(pools.subjects.length ? pools.subjects : SUBJECTS),
    ...(pools.sentimentLong.length ? pools.sentimentLong : SENTIMENT_LONG),
    ...(pools.sentimentShort.length ? pools.sentimentShort : SENTIMENT_SHORT),
    ...(pools.targets.length ? pools.targets : TARGETS),
  ];
  const pool = Array.from(new Set(merged));

  const picked: string[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.join(", ");
}
