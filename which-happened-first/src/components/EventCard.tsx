import type { HistoricalEvent } from '../data';

type Props = {
  event: HistoricalEvent;
  index: number;
  total: number;
  revealed: boolean;
  correct?: boolean;
  onUp: () => void;
  onDown: () => void;
};

export default function EventCard({ event, index, total, revealed, correct, onUp, onDown }: Props) {
  const revealStyle = revealed
    ? correct
      ? 'border-2 border-emerald-500 bg-emerald-500/10'
      : 'border-2 border-rose-500 bg-rose-500/10'
    : 'border-2 border-transparent';

  return (
    <div
      className={`rounded-xl bg-slate-800 ${revealStyle} transition-all duration-300 flex items-center gap-3 p-3`}
    >
      <div className="w-8 h-8 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{event.emoji}</span>
          <span className="text-lg font-semibold leading-snug">{event.title}</span>
        </div>
        {revealed && <div className="text-slate-300 text-sm mt-1 ml-11">{event.label}</div>}
      </div>
      {!revealed && (
        <div className="flex flex-col shrink-0">
          <button
            type="button"
            onClick={onUp}
            disabled={index === 0}
            aria-label="Move up"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-xl ${
              index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-indigo-300'
            }`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onDown}
            disabled={index === total - 1}
            aria-label="Move down"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-xl ${
              index === total - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-indigo-300'
            }`}
          >
            ▼
          </button>
        </div>
      )}
    </div>
  );
}
