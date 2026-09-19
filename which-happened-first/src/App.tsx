import { useEffect, useRef, useState } from 'react';
import { QUESTIONS, type HistoricalEvent } from './data';
import Timer from './components/Timer';
import EventCard from './components/EventCard';

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

type Phase = 'start' | 'playing' | 'results';
type Result = { correct: boolean; points: number; slots: boolean[] };

const btn =
  'rounded-xl px-6 py-3 font-bold bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition';

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
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setQIndex(0);
    setOrder(shuffle(QUESTIONS[0]));
    setSubmitted(false);
    setTimeLeft(TOTAL_TIME);
    setLastResult(null);
    setPhase('playing');
  };

  const next = () => {
    if (qIndex === NUM_QUESTIONS - 1) {
      setPhase('results');
      return;
    }
    const ni = qIndex + 1;
    setQIndex(ni);
    setOrder(shuffle(QUESTIONS[ni]));
    setSubmitted(false);
    setTimeLeft(TOTAL_TIME);
    setLastResult(null);
  };

  const shown = revealed ? correctOrder : order;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-xl mx-auto p-4 sm:p-6">
        {phase === 'start' && (
          <div className="flex flex-col items-center gap-6 pt-16 text-center">
            <h1 className="text-4xl font-extrabold">Which Happened First?</h1>
            <div className="text-slate-300 space-y-2">
              <p>Put the 4 events in order, earliest at the top, latest at the bottom.</p>
              <p>You have {TOTAL_TIME} seconds per question.</p>
              <p>
                A perfect order scores 100 points plus a time bonus — otherwise 10 points
                for each correctly placed card.
              </p>
            </div>
            <button type="button" className={btn} onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Question {qIndex + 1}/{NUM_QUESTIONS}
              </span>
              <span className="font-semibold">Score: {score}</span>
            </div>
            <Timer timeLeft={timeLeft} total={TOTAL_TIME} />
            <p className="text-sm text-slate-400">Earliest at the top</p>
            <div className="flex flex-col gap-3">
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
              <button type="button" className={`${btn} w-full`} onClick={submit}>
                Submit
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div
                  className={`rounded-xl px-4 py-3 text-center font-bold ${
                    lastResult?.correct
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {lastResult?.correct
                    ? `✓ Correct! +${lastResult.points}`
                    : `✗ Wrong · +${lastResult?.points}`}
                </div>
                <button type="button" className={`${btn} w-full`} onClick={next}>
                  {qIndex === NUM_QUESTIONS - 1 ? 'See results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'results' && (
          <div className="flex flex-col items-center gap-6 pt-16 text-center">
            <h1 className="text-3xl font-extrabold">Results</h1>
            <div className="text-6xl font-extrabold text-indigo-300">{score}</div>
            <div className="text-slate-300 space-y-1">
              <p>
                {correctCount}/{NUM_QUESTIONS} correct
              </p>
              <p>Best streak: {bestStreak}</p>
            </div>
            <button type="button" className={btn} onClick={start}>
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
