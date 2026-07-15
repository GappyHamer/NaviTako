"use client";

import { useEffect, useState } from "react";
import { useMessages } from "next-intl";
import { HERO_TITLES } from "@/config/ments";

/** 새로고침할 때마다 바뀌는 히어로 타이틀.
 *  SSR/첫 렌더는 항상 0번(하이드레이션 일치), 마운트 후 랜덤으로 교체한다.
 *  문구는 현재 로케일의 fun.heroTitles 풀에서 읽는다(없으면 ko 기본값). */
export default function HeroTitle() {
  const messages = useMessages() as { fun?: { heroTitles?: string[] } };
  const titles =
    messages.fun?.heroTitles && messages.fun.heroTitles.length > 0
      ? messages.fun.heroTitles
      : (HERO_TITLES as readonly string[]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * titles.length));
  }, [titles.length]);

  return (
    <h1 className="txt-strong animate-fade-up px-2 pt-12 text-center text-2xl font-bold leading-snug sm:pt-16 sm:text-3xl">
      {titles[index] ?? titles[0]}
    </h1>
  );
}
