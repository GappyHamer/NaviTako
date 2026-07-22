"use client";

/**
 * SpotlightText — OriginKit "Spotlight Text"(Cred Flashlight Effect) 기반.
 * 기본은 어둡게(dim) 깔린 텍스트 위에, 커서를 따라다니는 원형 스포트라이트가
 * 밝은(bright) 텍스트를 드러낸다. 어둠 속에서 손전등으로 글자를 비추는 느낌.
 *
 * 2레이어 트릭: 아래에 dim 텍스트, 위에 bright 텍스트 + 커서 추적 radial mask.
 * 마스크 원 안쪽만 bright 가 보이고 바깥은 dim 이 남는다.
 *
 * 프로젝트 적용 조정:
 *  - 터치(coarse pointer)/reduced-motion 환경은 중앙에 스포트라이트를 반쯤 열어
 *    "가려진 결과" 티저가 보이게 폴백.
 *  - 색은 호출부에서 시맨틱 토큰(var(--long) 등)으로 주입.
 */

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type ValueAnimationTransition,
} from "framer-motion";

type Props = {
  text: string;
  brightColor: string;
  dimColor: string;
  /** 스포트라이트 반지름(px) */
  maskSize?: number;
  /** 10~100: 마스크 중심의 완전 불투명 코어 비율(%) — 낮을수록 가장자리 페이드가 길다 */
  intensity?: number;
  transition?: ValueAnimationTransition;
  className?: string;
};

const DEFAULT_TRANSITION: ValueAnimationTransition = {
  type: "tween",
  duration: 0.3,
  ease: "easeInOut",
};

export default function SpotlightText({
  text,
  brightColor,
  dimColor,
  maskSize = 150,
  intensity = 14,
  transition = DEFAULT_TRANSITION,
  className,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [coarse, setCoarse] = useState(false);

  // 터치 기기(호버 불가) 감지 — 중앙 고정 스포트라이트 폴백
  useEffect(() => {
    try {
      setCoarse(window.matchMedia("(pointer: coarse)").matches);
    } catch {
      // matchMedia 미지원 → 인터랙티브 유지
    }
  }, []);

  const interactive = !prefersReducedMotion && !coarse;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // maskSize 0 = 스포트라이트 없음(완전히 dim). hover 진입 시 열린다.
  const maskX = useMotionValue(0);
  const maskY = useMotionValue(0);
  const maskSizeMV = useMotionValue(0);

  const core = Math.max(10, Math.min(100, intensity));
  const maskImage = useMotionTemplate`radial-gradient(circle ${maskSizeMV}px at ${maskX}px ${maskY}px, black, black ${core}%, transparent 100%)`;

  // 인터랙티브: 포인터 추적 + 진입/이탈 시 마스크 열고 닫기
  useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = (contentRef.current ?? el).getBoundingClientRect();
      maskX.set(e.clientX - rect.left);
      maskY.set(e.clientY - rect.top);
    };
    const onEnter = () => {
      animate(maskSizeMV, maskSize, transition);
    };
    const onLeave = () => {
      animate(maskSizeMV, 0, transition);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [interactive, maskSize, transition, maskX, maskY, maskSizeMV]);

  // 터치/reduced-motion: 중앙에 스포트라이트를 반쯤 열어 티저 노출
  useEffect(() => {
    if (interactive) return;
    const el = contentRef.current;
    const w = el?.clientWidth ?? 320;
    const h = el?.clientHeight ?? 120;
    maskX.set(w / 2);
    maskY.set(h / 2);
    maskSizeMV.set(maskSize * 0.66);
  }, [interactive, maskSize, maskX, maskY, maskSizeMV]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div ref={contentRef} style={{ position: "relative", width: "100%" }}>
        {/* BASE(아래): dim 텍스트 — 항상 보임 */}
        <div
          aria-label={text}
          style={{
            position: "relative",
            color: dimColor,
            userSelect: "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>

        {/* OVERLAY(위): bright 텍스트 — 커서 스포트라이트 안에서만 드러남 */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            color: brightColor,
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            WebkitMaskImage: maskImage,
            maskImage,
            WebkitMaskSize: "100%",
            maskSize: "100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {text}
        </motion.div>
      </div>
    </div>
  );
}
