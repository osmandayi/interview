type Props = {
  value: number;
  total: number;
  className?: string;
};

export function ProgressBar({ value, total, className = '' }: Props) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      className={`h-1.5 w-full rounded-full bg-neutral-200/80 dark:bg-neutral-800 overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          pct === 100 ? 'bg-emerald-500' : 'bg-brand-500'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
