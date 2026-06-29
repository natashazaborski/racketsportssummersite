import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournamentStore';
import BracketView from '@/components/BracketView';
import ScoreEntryModal from '@/components/ScoreEntryModal';
import type { Match } from '@/types';

/** Double-elimination bracket with courtside score entry. */
export default function BracketPage() {
  const tournament = useTournamentStore((s) => s.tournament);
  const recordScore = useTournamentStore((s) => s.recordScore);
  const [active, setActive] = useState<Match | null>(null);

  const playersById = useMemo(
    () => new Map((tournament?.players ?? []).map((p) => [p.id, p])),
    [tournament],
  );

  if (!tournament) {
    return (
      <EmptyState
        message="No tournament yet."
        cta={{ to: '/', label: 'Create one' }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-court-800">{tournament.name}</h1>
          {tournament.isComplete && (
            <p className="text-sm font-semibold text-court-600">Tournament complete 🎉</p>
          )}
        </div>
        {tournament.isComplete && (
          <Link to="/standings" className="btn-primary">
            See Places
          </Link>
        )}
      </header>

      <BracketView
        matches={tournament.matches}
        playersById={playersById}
        onScore={setActive}
      />

      {active && (
        <ScoreEntryModal
          match={active}
          playersById={playersById}
          onClose={() => setActive(null)}
          onSubmit={(scores) => {
            recordScore(active.id, scores);
            setActive(null);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({
  message,
  cta,
}: {
  message: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="card mt-10 text-center">
      <p className="mb-4 text-slate-500">{message}</p>
      <Link to={cta.to} className="btn-primary">
        {cta.label}
      </Link>
    </div>
  );
}
