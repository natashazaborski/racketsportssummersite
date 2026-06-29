import { useState } from 'react';
import type { Match, Player } from '@/types';

interface Props {
  match: Match;
  playersById: Map<string, Player>;
  onSubmit: (scores: [number, number]) => void;
  onClose: () => void;
}

/** Dark-themed score sheet with large +/- steppers for courtside entry. */
export default function ScoreEntry({ match, playersById, onSubmit, onClose }: Props) {
  const [scores, setScores] = useState<[number, number]>([
    match.slots[0].score ?? 0,
    match.slots[1].score ?? 0,
  ]);

  const name = (i: 0 | 1) =>
    playersById.get(match.slots[i].playerId ?? '')?.name ?? 'Player';

  const bump = (i: 0 | 1, delta: number) =>
    setScores((s) => {
      const next: [number, number] = [...s];
      next[i] = Math.max(0, next[i] + delta);
      return next;
    });

  const tie = scores[0] === scores[1];

  return (
    <div className="rsc-modal-backdrop" onClick={onClose}>
      <div className="rsc-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="rsc-modal-title">Enter score</h2>
        {([0, 1] as const).map((i) => (
          <div key={i} className="rsc-score-row">
            <span className="rsc-score-name">{name(i)}</span>
            <div className="rsc-stepper">
              <button type="button" className="rsc-step" onClick={() => bump(i, -1)}>
                −
              </button>
              <span className="rsc-score-val">{scores[i]}</span>
              <button type="button" className="rsc-step" onClick={() => bump(i, 1)}>
                +
              </button>
            </div>
          </div>
        ))}
        {tie && <p className="rsc-form-error">Scores can’t be tied — there must be a winner.</p>}
        <div className="rsc-form-actions">
          <button type="button" className="rsc-btn" disabled={tie} onClick={() => onSubmit(scores)}>
            Save result
          </button>
          <button type="button" className="rsc-btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
