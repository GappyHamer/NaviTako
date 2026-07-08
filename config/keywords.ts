/**
 * 예언 결과 키워드 풀. 결과 카드에는 카테고리 구분 없이 전체에서 무작위 3단어를 뽑는다.
 * (아래 분류는 관리 편의 + 대상 자동추가(CoinGecko)를 위한 것)
 * 예: "도지, 고래, 떡락"
 *
 * 대상(코인)은 시드 + 매주 자동 추가분(CoinGecko 트렌딩)이 합쳐진다(/api/keywords).
 * 기존 단어는 계속 유지하고 시드에 새 단어를 추가하는 식으로 관리한다.
 */

export type KeywordPools = {
  subjects: string[];
  sentimentLong: string[];
  sentimentShort: string[];
  targets: string[];
};

/** 주체 (누가/무엇이) */
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
  "CZ",
  "바이낸스",
  "업비트",
  "빗썸",
  "코인베이스",
  "블랙록",
  "마이크로스트래티지",
  "마이클세일러",
  "비탈릭",
  "저스틴선",
  "옐런",
  "SEC",
  "헤지펀드",
  "옵션창",
  "청산맵",
  "리딩방",
  "유튜버",
  "인플루언서",
  "디파이",
  "테더",
  "현물ETF",
  "반감기",
  "채굴장",
  "검은머리외국인",
  "슈퍼개미",
  "신규상장",
  "상장폐지",
  "그레이스케일",
  "큰손",
  "물린개미",
];

/** 분위기 — 상승 */
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
  "떡상각",
  "슈팅",
  "펌핑",
  "불기둥",
  "초록불",
  "익절",
  "바닥탈출",
  "저점매수",
  "달까지",
  "투더문",
  "파라볼릭",
  "슈퍼사이클",
  "알트시즌",
  "갭상승",
  "장대양봉",
  "매수벽",
  "폭등",
  "상한가",
  "무지성매수",
  "풀매수",
  "추매",
  "축포",
  "텐배거",
  "불개미",
  "눌림목매수",
  "세력매집",
  "개미승리",
  "라이트닝",
  "대박",
  "상승랠리",
];

/** 분위기 — 하락 */
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
  "떡락각",
  "나락",
  "지하실",
  "빨간불",
  "장대음봉",
  "롱청산",
  "폭락",
  "하한가",
  "패닉셀",
  "물타기",
  "존버",
  "상투",
  "고점물림",
  "반토막",
  "코인런",
  "러그풀",
  "스캠",
  "상폐각",
  "셀온뉴스",
  "매도벽",
  "개미무덤",
  "곡소리",
  "자본잠식",
  "갭하락",
  "한강각",
  "깡통",
  "마진콜",
  "강제청산",
  "흑우",
  "눈물",
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
  "폴리곤",
  "코스모스",
  "알고랜드",
  "스텔라",
  "비트캐시",
  "이더클래식",
  "파일코인",
  "헤데라",
  "인젝티브",
  "세이",
  "티아",
  "위프",
  "플로키",
  "메이커",
  "유니스왑",
  "에이브",
  "샌드박스",
  "디센트럴랜드",
  "갈라",
  "아비트럼",
  "옵티미즘",
  "스타크넷",
  "렌더",
  "그래프",
  "톤코인",
  "노트코인",
  "주피터",
  "파이코인",
  "웜홀",
  "무브먼트",
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
