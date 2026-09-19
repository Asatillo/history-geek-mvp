import { useEffect, useRef, useState } from 'react';
import { QUESTIONS, type HistoricalEvent } from './data';
import { rankFor } from './leaderboard';
import Timer from './components/Timer';
import EventCard from './components/EventCard';
import Leaderboard from './components/Leaderboard';

const TOTAL_TIME = 30;
const NUM_QUESTIONS = QUESTIONS.length;

const isChronological = (arr: HistoricalEvent[]) =>
  arr.every((e, i) => i === 0 || arr[i - 1].year <= e.year);

function shuffle(events: HistoricalEvent[]): HistoricalEvent[] {
  const arr = [...events];
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (isChronological(arr));
  return arr;
}

type Phase = 'start' | 'playing' | 'results' | 'leaderboard';
type Result = { correct: boolean; points: number; slots: boolean[] };

const btnPrimary =
  'rounded-sm px-6 py-3 font-semibold uppercase tracking-wider text-sm bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors';
const btnGhost =
  'rounded-sm px-6 py-3 text-sm uppercase tracking-wider border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors';
const sectionLabel = 'text-xs uppercase tracking-[0.2em] text-stone-500';

export default function App() {
  const [phase, setPhase] = useState<Phase>('start');
  const [qIndex, setQIndex] = useState(0);
  const [order, setOrder] = useState<HistoricalEvent[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [leaderboardFrom, setLeaderboardFrom] = useState<'start' | 'results'>('start');

  const correctOrder = [...QUESTIONS[qIndex]].sort((a, b) => a.year - b.year);
  const revealed = submitted;

  const move = (i: number, dir: -1 | 1) => {
    if (submitted) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const submit = () => {
    if (submitted) return;
    const slots = correctOrder.map((e, i) => order[i]?.id === e.id);
    const allCorrect = slots.every(Boolean);
    const points = allCorrect ? 100 + timeLeft : 10 * slots.filter(Boolean).length;
    const newStreak = allCorrect ? streak + 1 : 0;
    setScore((s) => s + points);
    setCorrectCount((c) => c + (allCorrect ? 1 : 0));
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));
    setSubmitted(true);
    setLastResult({ correct: allCorrect, points, slots });
  };

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  useEffect(() => {
    if (phase !== 'playing' || submitted) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, submitted, qIndex]);

  useEffect(() => {
    if (phase === 'playing' && !submitted && timeLeft === 0) submitRef.current();
  }, [timeLeft, phase, submitted]);

  const start = () => {
    setScore(0); setCorrectCount(0); setStreak(0); setBestStreak(0);
    setQIndex(0); setOrder(shuffle(QUESTIONS[0]));
    setSubmitted(false); setTimeLeft(TOTAL_TIME); setLastResult(null);
    setPhase('playing');
  };

  const next = () => {
    if (qIndex === NUM_QUESTIONS - 1) {
      setLastScore(score);
      setPhase('results');
      return;
    }
    const ni = qIndex + 1;
    setQIndex(ni);
    setOrder(shuffle(QUESTIONS[ni]));
    setSubmitted(false); setTimeLeft(TOTAL_TIME); setLastResult(null);
  };

  const openLeaderboard = (from: 'start' | 'results') => {
    setLeaderboardFrom(from);
    setPhase('leaderboard');
  };

  const shown = revealed ? correctOrder : order;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="max-w-xl mx-auto p-4 sm:p-6">
        {phase === 'start' && (
          <div className="pt-14">
            <p className={sectionLabel}>A chronology game</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">Which Happened First?</h1>
            <p className="text-stone-400 mt-4">Four events. Thirty seconds. Put them in order.</p>
            <div className="flex gap-3 mt-8">
              <button type="button" className={btnPrimary} onClick={start}>Start</button>
              <button type="button" className={btnGhost} onClick={() => openLeaderboard('start')}>
                Leaderboard
              </button>
            </div>

            <div className="border-t border-stone-800 mt-12 pt-10 space-y-10">
              <section>
                <p className={sectionLabel}>How it works</p>
                <div className="grid sm:grid-cols-3 gap-6 mt-4">
                  {[
                    'Read the four events',
                    'Move them with the arrows so the earliest is on top',
                    'Submit before the clock runs out',
                  ].map((step, i) => (
                    <div key={step}>
                      <div className="font-display text-amber-500 text-lg">{String(i + 1).padStart(2, '0')}</div>
                      <p className="text-stone-300 text-sm leading-relaxed mt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className={sectionLabel}>Scoring</p>
                <dl className="divide-y divide-stone-800 mt-4 border-y border-stone-800">
                  {[
                    ['Perfect order', '100 pts'],
                    ['Time bonus (perfect order only)', '+1 pt per second left'],
                    ['Otherwise', '10 pts per card in the right slot'],
                    ['Maximum per round', '130 pts'],
                    ['Maximum per game', '1,300 pts'],
                  ].map(([term, def]) => (
                    <div key={term} className="flex justify-between py-2.5 text-sm">
                      <dt className="text-stone-400">{term}</dt>
                      <dd className="text-stone-100 font-display tabular-nums">{def}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <p className={sectionLabel}>What you'll face</p>
                <p className="text-stone-300 leading-relaxed mt-4 text-sm">
                  Ten rounds, easy to hard — from the pyramids and the Roman Republic
                  through the medieval world to the twentieth century. Only the titles
                  are shown; the dates are revealed after you answer.
                </p>
              </section>

              <p className="text-xs text-stone-600">
                No account needed · Runs entirely in your browser
              </p>
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-end justify-between border-b border-stone-800 pb-4">
              <span data-testid="question" className="font-display text-lg tabular-nums">
                Question {String(qIndex + 1).padStart(2, '0')} / {NUM_QUESTIONS}
              </span>
              <div className="text-right">
                <div className="text-stone-500 text-xs uppercase tracking-widest">Score</div>
                <div data-testid="score" className="font-display text-xl text-amber-500 tabular-nums">{score}</div>
              </div>
            </div>
            <Timer timeLeft={timeLeft} total={TOTAL_TIME} />
            <p className={sectionLabel}>Earliest at the top</p>
            <div className="flex flex-col gap-2">
              {shown.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  total={shown.length}
                  revealed={revealed}
                  correct={revealed ? lastResult?.slots[i] : undefined}
                  onUp={() => move(i, -1)}
                  onDown={() => move(i, 1)}
                />
              ))}
            </div>
            {!submitted ? (
              <button type="button" className={`${btnPrimary} w-full mt-2`} onClick={submit}>
                Submit
              </button>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                <div
                  data-testid="result-banner"
                  className={`border-l-2 pl-4 py-2 ${
                    lastResult?.correct ? 'border-emerald-500' : 'border-red-500'
                  }`}
                >
                  <div
                    className={`font-semibold ${
                      lastResult?.correct ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {lastResult?.correct ? 'Correct' : 'Incorrect'} — +{lastResult?.points}
                  </div>
                  <div className="text-stone-500 text-sm mt-0.5">
                    {lastResult?.correct
                      ? `Perfect order · 100 pts + ${lastResult.points - 100} s bonus`
                      : `${lastResult?.slots.filter(Boolean).length} of ${shown.length} cards in place`}
                  </div>
                </div>
                <button type="button" className={`${btnPrimary} w-full`} onClick={next}>
                  {qIndex === NUM_QUESTIONS - 1 ? 'See results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'results' && (
          <div className="pt-16">
            <p className={sectionLabel}>Final score</p>
            <div data-testid="final-score" className="font-display text-7xl text-amber-500 tabular-nums mt-4">
              {score.toLocaleString('en-US')}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-10 border-y border-stone-800 py-5">
              {([
                ['Correct', `${correctCount} / ${NUM_QUESTIONS}`, null],
                ['Best streak', String(bestStreak), null],
                ['Rank', `#${rankFor(score)}`, 'worldwide'],
              ] as [string, string, string | null][]).map(([label, value, sub]) => (
                <div key={label}>
                  <div className="text-stone-500 text-xs uppercase tracking-widest">{label}</div>
                  <div className="font-display text-xl text-stone-100 tabular-nums mt-1">
                    {value}
                    {sub && <span className="text-xs text-stone-500 ml-1">{sub}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" className={btnPrimary} onClick={start}>Play again</button>
              <button type="button" className={btnGhost} onClick={() => openLeaderboard('results')}>
                Leaderboard
              </button>
            </div>
          </div>
        )}

        {phase === 'leaderboard' && (
          <Leaderboard
            playerScore={lastScore}
            onBack={() => setPhase(leaderboardFrom)}
            onPlay={start}
          />
        )}
      </div>
    </div>
  );
}
