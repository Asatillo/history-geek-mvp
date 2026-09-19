export default function Timer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = (timeLeft / total) * 100;
  const barColor = timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-600';

  return (
    <div className="flex items-center gap-3">
      <div className="h-px bg-stone-800 flex-1">
        <div
          className={`${barColor} h-px transition-[width] duration-1000 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span data-testid="timer-seconds" className="text-xs tabular-nums text-stone-500">
        {timeLeft}s
      </span>
    </div>
  );
}
