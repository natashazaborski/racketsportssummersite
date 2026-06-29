import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Match, Player } from '@/types';
import { buildDoubleElimination, scoreMatch, isTournamentComplete } from '@/lib/bracket';
import { makePlayers } from '@/lib/tournament';

/** A fully self-contained bracket for one sport + date + period. */
export interface BracketInstance {
  players: Player[];
  matches: Match[];
  isComplete: boolean;
  createdAt: string;
}

interface BracketState {
  /** Keyed by `instanceKey(sport, date, period)`. */
  instances: Record<string, BracketInstance>;

  /** Confirm an attendance roster and generate the double-elim bracket. */
  confirmAttendance: (key: string, names: string[]) => void;
  /** Record a match result; the bracket advances automatically. */
  recordScore: (key: string, matchId: string, scores: [number, number]) => void;
  /** Remove an instance (clears its roster + bracket). */
  clearInstance: (key: string) => void;
}

export const useBracketStore = create<BracketState>()(
  persist(
    (set, get) => ({
      instances: {},

      confirmAttendance: (key, names) => {
        const players = makePlayers(names);
        if (players.length < 2) return;
        const matches = buildDoubleElimination(players);
        set((s) => ({
          instances: {
            ...s.instances,
            [key]: {
              players,
              matches,
              isComplete: isTournamentComplete(matches),
              createdAt: new Date().toISOString(),
            },
          },
        }));
      },

      recordScore: (key, matchId, scores) => {
        const inst = get().instances[key];
        if (!inst) return;
        const matches = scoreMatch(inst.matches, matchId, scores);
        set((s) => ({
          instances: {
            ...s.instances,
            [key]: { ...inst, matches, isComplete: isTournamentComplete(matches) },
          },
        }));
      },

      clearInstance: (key) =>
        set((s) => {
          const next = { ...s.instances };
          delete next[key];
          return { instances: next };
        }),
    }),
    {
      name: 'racket-brackets', // localStorage — one entry holds every instance
    },
  ),
);
