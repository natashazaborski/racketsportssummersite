import { useState } from 'react';
import type { Match, Player } from '@/types';

interface Props {
  match: Match;
  playersById: Map<string, Player>;
  onSubmit: (scores: [number, number]) => void;
  onClose: () => void;
}

/** Full-screen score sheet with large +/- steppers for courtside entry. */
export default function ScoreEntryModal({ match, playersById, onSubmit, onClose }: Props) {
  const [scores, setScores] = useState<[number, number]>([
    match.slots[0].score ?? 0,
    match.slots[1].score ?? 0,
  ]);

  const name = (i: 0 | 1) =>
    playersById.get(match.slots[i].playerId ?? '')?.name ?? 'Player';

  const setScore = (i: 0 | 1, delta: number) =>
    setScores((s) => {
      const next: [number, number] = [...s];
      next[i] = Math.max(0, next[i] + delta);
      return next;
    });

  const tie = scores[0] === scores[1];

  return (
    <div className="no-print fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        <h2 className="mb-4 text-center text-lg font-bold text-court-800">Enter Score</h2>

        {[0, 1].map((idx) => {
          const i = idx as 0 | 1;
          return (
            <div key={i} className="mb-3 flex items-center justify-between gap-3">
              <span className="flex-1 truncate text-lg font-semibold">{name(i)}</span>
              <div className="flex items-center gap-3">
                <button className="btn-ghost h-12 w-12 text-2xl" onClick={() => setScore(i, -1)}>
                  −
                </button>
                <span className="w-10 text-center text-2xl font-bold tabular-nums">
                  {scores[i]}
                </span>
                <button className="btn-ghost h-12 w-12 text-2xl" onClick={() => setScore(i, 1)}>
                  +
                </button>
              </div>
            </div>
          );
        })}

        {tie && (
          <p className="mb-2 text-center text-sm font-medium text-clay">
            Scores can’t be tied — there must be a winner.
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            disabled={tie}
            onClick={() => onSubmit(scores)}
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}
