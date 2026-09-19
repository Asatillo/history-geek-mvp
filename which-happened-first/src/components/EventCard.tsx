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
      ? 'border-emerald-600 bg-emerald-950/50'
      : 'border-red-700 bg-red-950/50'
    : 'border-stone-800 bg-stone-900';

  const arrow = (dir: -1 | 1, disabled: boolean, label: string) => (
    <button
      type="button"
      onClick={dir === -1 ? onUp : onDown}
      disabled={disabled}
      aria-label={label}
      className={`group w-11 h-11 flex items-center justify-center ${
        disabled ? 'opacity-25 cursor-not-allowed' : ''
      }`}
    >
      <span
        className={`w-10 h-10 flex items-center justify-center border border-stone-800 rounded-sm text-stone-400 text-sm ${
          disabled ? '' : 'group-hover:text-stone-100 group-hover:border-stone-600'}`}
      >{dir === -1 ? '▲' : '▼'}</span>
    </button>
  );

  return (
    <div
      data-testid="card"
      data-correct={revealed ? String(Boolean(correct)) : undefined}
      className={`rounded-md border px-4 py-3 transition-colors duration-300 flex items-center gap-4 ${revealStyle}`}
    >
      <div className="font-display text-stone-500 text-lg w-6 shrink-0 tabular-nums">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{event.emoji}</span>
          <span
            data-testid="card-title"
            className="text-base sm:text-lg font-medium text-stone-100 leading-snug"
          >
            {event.title}
          </span>
        </div>
        {revealed && (
          <div data-testid="card-date" className="font-display text-sm text-amber-500/90 mt-1 ml-9">
            {event.label}
          </div>
        )}
      </div>
      {!revealed && (
        <div className="flex flex-col shrink-0">
          {arrow(-1, index === 0, 'Move up')}
          {arrow(1, index === total - 1, 'Move down')}
        </div>
      )}
    </div>
  );
}
