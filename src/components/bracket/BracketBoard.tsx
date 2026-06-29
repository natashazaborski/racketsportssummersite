import { useMemo, useState } from 'react';
import type { Match, Player } from '@/types';
import { isBye } from '@/lib/bracket';
import ScoreEntry from './ScoreEntry';

interface Props {
  matches: Match[];
  players: Player[];
  /** Omit to render read-only (e.g. the placeholder preview). */
  onScore?: (matchId: string, scores: [number, number]) => void;
}

function slotName(playerId: string | null, players: Map<string, Player>): string {
  if (playerId === null) return 'TBD';
  if (isBye(playerId)) return 'Bye';
  return players.get(playerId)?.name ?? 'Unknown';
}

/** Both bracket sides + grand final, styled for the dark broadcast theme. */
export default function BracketBoard({ matches, players, onScore }: Props) {
  const [active, setActive] = useState<Match | null>(null);

  const playersById = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  const winners = matches.filter((m) => m.side === 'winners');
  const losers = matches.filter((m) => m.side === 'losers');
  // GF2 only appears once it's seated (a reset is actually being played).
  const grandFinals = matches
    .filter((m) => m.side === 'grandFinal')
    .filter((m) => m.round === 1 || m.slots[0].playerId !== null);

  return (
    <div className="rsc-board">
      <BracketSection
        title="Winners Bracket"
        roundLabel={(r) => `Round ${r}`}
        matches={winners}
        playersById={playersById}
        onScore={onScore ? setActive : undefined}
      />
      <BracketSection
        title="Losers Bracket"
        roundLabel={(r) => `Round ${r}`}
        matches={losers}
        playersById={playersById}
        onScore={onScore ? setActive : undefined}
      />
      <BracketSection
        title="Grand Final"
        roundLabel={(r) => (r === 2 ? 'Reset' : 'Final')}
        matches={grandFinals}
        playersById={playersById}
        onScore={onScore ? setActive : undefined}
      />

      {active && onScore && (
        <ScoreEntry
          match={active}
          playersById={playersById}
          onClose={() => setActive(null)}
          onSubmit={(scores) => {
            onScore(active.id, scores);
            setActive(null);
          }}
        />
      )}
    </div>
  );
}

function BracketSection({
  title,
  roundLabel,
  matches,
  playersById,
  onScore,
}: {
  title: string;
  roundLabel: (round: number) => string;
  matches: Match[];
  playersById: Map<string, Player>;
  onScore?: (match: Match) => void;
}) {
  if (matches.length === 0) return null;
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  return (
    <section className="rsc-board-section">
      <h2 className="rsc-board-title">{title}</h2>
      <div className="rsc-rounds">
        {rounds.map((round) => (
          <div key={round} className="rsc-round">
            <h3 className="rsc-round-label">{roundLabel(round)}</h3>
            {matches
              .filter((m) => m.round === round)
              .sort((a, b) => a.order - b.order)
              .map((m) => (
                <MatchPanel
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
}

function MatchPanel({
  match,
  playersById,
  onScore,
}: {
  match: Match;
  playersById: Map<string, Player>;
  onScore?: (match: Match) => void;
}) {
  const ready =
    match.slots[0].playerId !== null &&
    match.slots[1].playerId !== null &&
    !match.isBye &&
    !isBye(match.slots[0].playerId) &&
    !isBye(match.slots[1].playerId);

  return (
    <div className="rsc-match">
      <div className="rsc-match-slots">
        {match.slots.map((slot, i) => {
          const isWinner = match.winnerId !== null && match.winnerId === slot.playerId;
          return (
            <div key={i} className={`rsc-slot ${isWinner ? 'is-winner' : ''}`}>
              <span className="rsc-slot-name">{slotName(slot.playerId, playersById)}</span>
              <span className="rsc-slot-score">{slot.score ?? '–'}</span>
            </div>
          );
        })}
      </div>
      {onScore && (
        <button
          type="button"
          className="rsc-match-btn"
          disabled={!ready}
          onClick={() => onScore(match)}
        >
          {match.winnerId ? 'Edit' : 'Score'}
        </button>
      )}
    </div>
  );
}
