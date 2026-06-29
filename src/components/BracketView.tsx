import type { Match, Player } from '@/types';
import MatchCard from './MatchCard';

interface Props {
  matches: Match[];
  playersById: Map<string, Player>;
  onScore: (match: Match) => void;
}

const ROUND_LABEL: Record<Match['side'], string> = {
  winners: 'Winners Round',
  losers: 'Losers Round',
  grandFinal: 'Grand Final',
};

/**
 * Renders the bracket grouped by side and round. Horizontal scroll keeps
 * each round in a readable column on phones; stacks naturally on tablets.
 */
export default function BracketView({ matches, playersById, onScore }: Props) {
  const sides: Match['side'][] = ['winners', 'losers', 'grandFinal'];

  return (
    <div className="space-y-8">
      {sides.map((side) => {
        const sideMatches = matches.filter((m) => m.side === side);
        if (sideMatches.length === 0) return null;
        const rounds = [...new Set(sideMatches.map((m) => m.round))].sort((a, b) => a - b);

        return (
          <section key={side}>
            <h2 className="mb-3 text-lg font-bold capitalize text-court-800">
              {side === 'grandFinal' ? 'Grand Final' : `${side} Bracket`}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {rounds.map((round) => (
                <div key={round} className="w-64 shrink-0 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {side === 'grandFinal' ? 'Final' : `${ROUND_LABEL[side]} ${round}`}
                  </h3>
                  {sideMatches
                    .filter((m) => m.round === round)
                    .sort((a, b) => a.order - b.order)
                    .map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        playersById={playersById}
                        onScore={onScore}
                      />
                    ))}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
