"use client";

import { useEffect, useState } from "react";
import { HERO_TITLES } from "@/config/ments";

/** 새로고침할 때마다 바뀌는 히어로 타이틀.
 *  SSR/첫 렌더는 항상 0번(하이드레이션 일치), 마운트 후 랜덤으로 교체한다. */
export default function HeroTitle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * HERO_TITLES.length));
  }, []);

  return (
    <h1 className="txt-strong animate-fade-up px-2 pt-12 text-center text-2xl font-bold leading-snug sm:pt-16 sm:text-3xl">
      {HERO_TITLES[index]}
    </h1>
  );
}
