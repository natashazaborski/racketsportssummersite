import { useMemo, useState } from 'react';
import AttendanceUpload from '@/components/AttendanceUpload';
import BracketBoard from '@/components/bracket/BracketBoard';
import { buildDoubleElimination, championId } from '@/lib/bracket';
import { useBracketStore } from '@/store/bracketStore';
import {
  PERIODS,
  type PeriodId,
  instanceKey,
  todayISO,
  formatDate,
  placeholderNames,
  makePlayers,
} from '@/lib/tournament';
import { useSport } from '@/components/SportLayout';

/**
 * One sport's tournament section. Pick a date + period to load that specific
 * bracket instance; everything is keyed by sport + date + period and persisted
 * independently. The sport + accent come from the surrounding SportLayout.
 */
export default function SportTournamentPage() {
  const { sport } = useSport();

  const [date, setDate] = useState<string>(todayISO());
  const [period, setPeriod] = useState<PeriodId>(PERIODS[0].id);

  const key = instanceKey(sport, date, period);
  const instance = useBracketStore((s) => s.instances[key]);
  const confirmAttendance = useBracketStore((s) => s.confirmAttendance);
  const recordScore = useBracketStore((s) => s.recordScore);
  const clearInstance = useBracketStore((s) => s.clearInstance);

  // Preview bracket (placeholder players) when nothing is confirmed yet.
  const preview = useMemo(() => {
    if (instance) return null;
    const players = makePlayers(placeholderNames(8));
    return { players, matches: buildDoubleElimination(players) };
  }, [instance, key]);

  const champion = instance
    ? instance.players.find((p) => p.id === championId(instance.matches))
    : null;

  return (
    <div>
      <div className="rsc-tournament-head">
        <span className="rsc-section-eyebrow">Tournament</span>
        <div className="rsc-date-corner">
          <span className="rsc-eyebrow rsc-date-display">{formatDate(date)}</span>
          <input
            type="date"
            className="rsc-date-input"
            value={date}
            onChange={(e) => setDate(e.target.value || todayISO())}
          />
        </div>
      </div>

      <div className="rsc-tabs rsc-period-tabs">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`rsc-tab ${period === p.id ? 'is-active' : ''}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {instance ? (
        <>
          <div className="rsc-instance-bar">
            <span className="rsc-instance-meta">
              {instance.players.length} players •{' '}
              {instance.isComplete ? 'Complete' : 'In progress'}
            </span>
            <button
              type="button"
              className="rsc-btn-ghost"
              onClick={() => {
                if (
                  confirm(
                    'Clear this bracket and its results? You can upload attendance again.',
                  )
                ) {
                  clearInstance(key);
                }
              }}
            >
              Reset period
            </button>
          </div>

          {champion && (
            <div className="rsc-champion">
              <span className="rsc-champion-label">Champion</span>
              <span className="rsc-champion-name">{champion.name}</span>
            </div>
          )}

          <BracketBoard
            matches={instance.matches}
            players={instance.players}
            onScore={(matchId, scores) => recordScore(key, matchId, scores)}
          />
        </>
      ) : (
        <>
          <AttendanceUpload onConfirm={(names) => confirmAttendance(key, names)} />
          {preview && (
            <>
              <p className="rsc-preview-note">
                Preview with placeholder players — upload attendance to start scoring.
              </p>
              <BracketBoard matches={preview.matches} players={preview.players} />
            </>
          )}
        </>
      )}
    </div>
  );
}
