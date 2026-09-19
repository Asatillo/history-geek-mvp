export default function Timer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = (timeLeft / total) * 100;
  const barColor =
    timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor =
    timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="flex items-center gap-3">
      <div className="bg-slate-700 rounded-full h-2 flex-1">
        <div
          className={`${barColor} h-2 rounded-full transition-[width] duration-1000 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-semibold tabular-nums ${textColor}`}>{timeLeft}s</span>
    </div>
  );
}
