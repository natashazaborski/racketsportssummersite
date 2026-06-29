import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournamentStore';
import { generateStandings } from '@/lib/standings';

const MEDAL: Record<number, string> = { 1: '🏆', 2: '🥈', 3: '🥉' };

/** Final places, computed live from the bracket results. */
export default function StandingsPage() {
  const tournament = useTournamentStore((s) => s.tournament);
  const standings = useMemo(
    () => (tournament ? generateStandings(tournament) : []),
    [tournament],
  );

  if (!tournament) {
    return (
      <div className="card mt-10 text-center">
        <p className="mb-4 text-slate-500">No tournament yet.</p>
        <Link to="/" className="btn-primary">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-court-800">Final Standings</h1>
        {tournament.isComplete && (
          <Link to="/awards" className="btn-primary">
            Awards
          </Link>
        )}
      </header>

      {!tournament.isComplete && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Tournament still in progress — places update as matches finish.
        </p>
      )}

      <ol className="space-y-2">
        {standings.map((s) => (
          <li
            key={s.player.id}
            className="card flex items-center gap-3"
          >
            <span className="w-8 text-center text-xl font-bold tabular-nums">
              {MEDAL[s.place] ?? s.place}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{s.player.name}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
            <span className="text-sm text-slate-500 tabular-nums">
              {s.wins}–{s.losses}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
