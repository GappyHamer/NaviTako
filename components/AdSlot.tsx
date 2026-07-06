/**
 * 애드센스 광고 자리 예약 컴포넌트.
 * - 승인 전: 은은한 placeholder만 렌더 (고정 높이 예약으로 CLS 0 유지)
 * - 승인 후: 이 컴포넌트 내부를 실제 애드센스 <ins> 코드로 교체하면 된다.
 * - 배치 규칙: 가이드 글 상/중/하, 시장온도 하단 — 신탁 버튼 근처 금지 (스펙 4장)
 */

type AdSlotProps = {
  /** 슬롯 식별자 (예: guide-top, guide-middle, market-bottom) */
  slot: string;
  /** 예약 높이(px) — 광고 삽입 시에도 레이아웃 이동이 없도록 고정 */
  height?: number;
  className?: string;
};

export default function AdSlot({ slot, height = 250, className = "" }: AdSlotProps) {
  return (
    <div
      className={`ad-slot ${className}`}
      style={{ height }}
      data-ad-slot={slot}
      role="complementary"
      aria-label="광고 영역"
    >
      <span>AD</span>
    </div>
  );
}
