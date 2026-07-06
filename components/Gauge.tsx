/**
 * 시장온도 페이지용 수평 게이지 (서버 컴포넌트, 순수 CSS).
 * value: 0~100 (%). null이면 데이터 없음 표시.
 */

type GaugeProps = {
  value: number | null;
  leftLabel: string;
  rightLabel: string;
  /** 채움 색 (tailwind class) */
  barClassName?: string;
};

export default function Gauge({
  value,
  leftLabel,
  rightLabel,
  barClassName = "bg-violet-500",
}: GaugeProps) {
  const pct = value === null ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
        {value !== null && (
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${barClassName}`}
            style={{ width: `${pct}%` }}
          />
        )}
        {/* 중앙 기준선 */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-600" />
      </div>
    </div>
  );
}
