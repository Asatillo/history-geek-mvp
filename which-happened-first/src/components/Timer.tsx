export default function Timer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = (timeLeft / total) * 100;
  const barColor = timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-600';

  return (
    <div className="flex items-center gap-3">
      <div className="h-0.5 bg-stone-600 flex-1">
        <div
          className={`${barColor} h-0.5 transition-[width] duration-1000 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span data-testid="timer-seconds" className="text-xs tabular-nums text-stone-400">
        {timeLeft}s
      </span>
    </div>
  );
}
