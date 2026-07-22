"use client";

/**
 * GooParticles — 소환 중 문어 중심으로 빨려드는 SVG gooey 파티클.
 * SVG feGaussianBlur + feColorMatrix 표준 goo 레시피로 입자들이 끈적하게
 * 뭉치며 수렴한다. 애니메이션은 transform/opacity 만 사용(60fps).
 * 좌표/타이밍은 기존 SUMMON_PARTICLES 분포(반지름 260~365px)를 재사용.
 */

import type { CSSProperties } from "react";

const GOO_PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 3) * 0.15;
  const radius = 260 + (i % 4) * 35; // 260~365px 넓은 분포에서 응집
  return {
    dx: Math.round(Math.cos(angle) * radius),
    dy: Math.round(Math.sin(angle) * radius),
    delay: Number(((i % 6) * 0.1).toFixed(2)),
    duration: Number((1.15 + (i % 3) * 0.22).toFixed(2)),
    r: 14 + (i % 3) * 2, // 14~18px
  };
});

export default function GooParticles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
      aria-hidden="true"
    >
      {/* grid 중앙정렬은 암시적 트랙이 svg 크기(800px)로 늘어나 좌상단 기준이 됨 →
          절대배치 + 음수 마진으로 svg 중심을 컨테이너(문어) 중심에 고정 */}
      <svg
        width={800}
        height={800}
        viewBox="-400 -400 800 800"
        className="overflow-visible"
        style={{
          maxWidth: "none",
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: -400,
          marginTop: -400,
        }}
      >
        <defs>
          {/* filterUnits=userSpaceOnUse 고정 영역 → 매 프레임 bbox 재계산 방지,
              stdDeviation 6 으로 래스터 비용 완화(goo 임계는 colorMatrix 가 유지) */}
          <filter
            id="tako-goo"
            filterUnits="userSpaceOnUse"
            x={-400}
            y={-400}
            width={800}
            height={800}
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -14"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
        <g filter="url(#tako-goo)">
          {GOO_PARTICLES.map((p, i) => (
            <circle
              key={i}
              className="goo-particle"
              cx={0}
              cy={0}
              r={p.r}
              fill="var(--accent)"
              style={
                {
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                } as CSSProperties
              }
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
