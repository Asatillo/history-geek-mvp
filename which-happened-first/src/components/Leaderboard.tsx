import { LEADERBOARD, rankFor } from '../leaderboard';

export default function Leaderboard({ playerScore }: { playerScore: number | null }) {
  return (
    <section id="leaderboard">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Worldwide leaderboard</p>
      <h2 className="font-display text-2xl mt-2">Top 15 players</h2>
      <p className="text-stone-400 text-sm mt-1">Best single-game scores</p>

      <div className="divide-y divide-stone-700 mt-5 border-y border-stone-700">
        {LEADERBOARD.map((p, i) => (
          <div
            data-testid="leaderboard-row"
            key={p.name}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center py-3"
          >
            <span className={`font-display ${i < 3 ? 'text-amber-500' : 'text-stone-400'}`}>
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="text-stone-100 block">{p.name}</span>
              <span className="text-xs text-stone-400">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 mr-1.5">{p.code}</span>
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
          className="border-t border-amber-600/40 bg-amber-900/30 px-4 py-3 text-sm text-stone-200"
        >
          You — {playerScore.toLocaleString('en-US')} — would rank #{rankFor(playerScore)}
        </div>
      )}
    </section>
  );
}
