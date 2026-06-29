import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournamentStore';
import { generateAwards } from '@/lib/awards';

/**
 * Printable award certificates. "Print" uses the browser's native print
 * dialog (Save as PDF works offline); only the certificates are printed.
 */
export default function AwardsPage() {
  const tournament = useTournamentStore((s) => s.tournament);
  const awards = useMemo(
    () => (tournament ? generateAwards(tournament) : []),
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
      <header className="no-print flex items-center justify-between">
        <h1 className="text-xl font-bold text-court-800">Awards</h1>
        <button className="btn-primary" onClick={() => window.print()}>
          🖨️ Print
        </button>
      </header>

      {!tournament.isComplete && (
        <p className="no-print rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Finish the tournament for final placement awards. Participation
          certificates are ready now.
        </p>
      )}

      <div className="space-y-6">
        {awards.map((a) => (
          <div
            key={a.id}
            className="award-card print-page card border-4 border-court-600 text-center"
          >
            <div className="text-5xl">{a.icon}</div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-court-600">
              {tournament.name}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-court-800">{a.title}</h2>
            <p className="mt-4 text-sm text-slate-400">Awarded to</p>
            <p className="text-3xl font-bold">{a.recipient}</p>
            <p className="mt-4 text-sm text-slate-500">{a.subtitle}</p>
            <p className="mt-6 text-xs text-slate-400">
              {new Date(tournament.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
