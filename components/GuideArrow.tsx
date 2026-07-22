"use client";

/**
 * GuideArrow — mystery 단계에서 문어와 미스터리 카드 사이에 놓이는 유도 화살표.
 * 살짝 굽은 세로 path + 화살촉이 한 번 그려진 뒤(stroke-dashoffset 드로잉)
 * 위아래로 bob(transform, 무한). 순수 장식 → aria-hidden.
 */

export default function GuideArrow() {
  return (
    <svg
      className="guide-arrow"
      width={48}
      height={64}
      viewBox="0 0 48 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="guide-arrow-draw"
        d="M24 6 C 16 22, 32 34, 24 50"
        stroke="var(--accent)"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="guide-arrow-draw guide-arrow-head"
        d="M15 42 L24 52 L33 42"
        stroke="var(--accent)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
