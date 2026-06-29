import type { Match, Player } from '@/types';
import { isBye } from '@/lib/bracket';

interface Props {
  match: Match;
  playersById: Map<string, Player>;
  onScore: (match: Match) => void;
}

function slotName(playerId: string | null, players: Map<string, Player>): string {
  if (playerId === null) return 'TBD';
  if (isBye(playerId)) return 'Bye';
  return players.get(playerId)?.name ?? 'Unknown';
}

/** A single match: two players, scores, and a tap-to-enter button. */
export default function MatchCard({ match, playersById, onScore }: Props) {
  const ready =
    match.slots[0].playerId !== null &&
    match.slots[1].playerId !== null &&
    !match.isBye &&
    !isBye(match.slots[0].playerId) &&
    !isBye(match.slots[1].playerId);

  return (
    <div className="card flex items-stretch gap-3">
      <div className="flex-1 space-y-1">
        {match.slots.map((slot, i) => {
          const isWinner = match.winnerId !== null && match.winnerId === slot.playerId;
          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                isWinner ? 'bg-court-100 font-bold text-court-800' : 'bg-slate-50'
              }`}
            >
              <span className="truncate">{slotName(slot.playerId, playersById)}</span>
              <span className="ml-2 tabular-nums text-slate-500">
                {slot.score ?? '–'}
              </span>
            </div>
          );
        })}
      </div>
      <button
        className="btn-ghost shrink-0 px-3"
        disabled={!ready}
        onClick={() => onScore(match)}
      >
        {match.winnerId ? 'Edit' : 'Score'}
      </button>
    </div>
  );
}
