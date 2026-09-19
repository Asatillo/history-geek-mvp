import { LEADERBOARD, rankFor } from '../leaderboard';

type Props = {
  playerScore: number | null;
  onBack: () => void;
  onPlay: () => void;
};

const btnPrimary =
  'rounded-sm px-6 py-3 font-semibold uppercase tracking-wider text-sm bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors';
const btnGhost =
  'rounded-sm px-6 py-3 text-sm uppercase tracking-wider border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors';

export default function Leaderboard({ playerScore, onBack, onPlay }: Props) {
  return (
    <div className="pt-10">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Worldwide</p>
      <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-2">Top 15 players</h1>
      <p className="text-stone-500 text-sm mt-2">Best single-game scores</p>

      <div className="divide-y divide-stone-800 mt-8 border-y border-stone-800">
        {LEADERBOARD.map((p, i) => (
          <div
            data-testid="leaderboard-row"
            key={p.name}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center py-3"
          >
            <span className={`font-display ${i < 3 ? 'text-amber-500' : 'text-stone-500'}`}>
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="text-stone-100 block">{p.name}</span>
              <span className="text-xs text-stone-500">
                <span className="text-[10px] uppercase tracking-widest text-stone-600 mr-1.5">{p.code}</span>
                {p.country}
              </span>
            </span>
            <span className="font-display tabular-nums text-right">{p.score.toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>

      {playerScore !== null && (
        <div
          data-testid="leaderboard-you"
          className="border-t border-amber-600/40 bg-amber-950/20 px-4 py-3 text-sm text-stone-300"
        >
          You — {playerScore.toLocaleString('en-US')} — would rank #{rankFor(playerScore)}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button type="button" className={btnGhost} onClick={onBack}>
          Back
        </button>
        <button type="button" className={btnPrimary} onClick={onPlay}>
          Play
        </button>
      </div>
    </div>
  );
}
