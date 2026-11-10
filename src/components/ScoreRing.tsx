type Props = { score: number; size?: number; label?: string };

export function scoreTone(score: number) {
  if (score >= 70) return { stroke: 'stroke-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 40) return { stroke: 'stroke-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { stroke: 'stroke-rose-500', text: 'text-rose-600 dark:text-rose-400' };
}

export function ScoreRing({ score, size = 112, label }: Props) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  const tone = scoreTone(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-neutral-200 dark:stroke-neutral-800" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className={`${tone.stroke} transition-[stroke-dashoffset] duration-700 ease-out`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={`text-2xl font-bold tabular-nums ${tone.text}`}>%{score}</div>
          {label && <div className="text-[11px] text-neutral-500">{label}</div>}
        </div>
      </div>
    </div>
  );
}
