import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Tournament } from '@/types';
import { buildDoubleElimination, enterScore } from '@/lib/bracket';

const uid = () =>
  (crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);

interface TournamentState {
  tournament: Tournament | null;

  /** Create a fresh tournament. Names are auto-seeded in input order. */
  createTournament: (name: string, playerNames: string[]) => void;
  /** Record a match result; the bracket advances automatically. */
  recordScore: (matchId: string, scores: [number, number]) => void;
  /** Wipe everything (with confirmation handled in the UI). */
  reset: () => void;
}

function makePlayers(names: string[]): Player[] {
  return names
    .map((n) => n.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: uid(), name, seed: i + 1 }));
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournament: null,

      createTournament: (name, playerNames) => {
        const players = makePlayers(playerNames);
        const matches = buildDoubleElimination(players);
        set({
          tournament: {
            id: uid(),
            name: name.trim() || 'Summer Camp Tournament',
            createdAt: new Date().toISOString(),
            players,
            matches,
            isComplete: false,
          },
        });
      },

      recordScore: (matchId, scores) => {
        const t = get().tournament;
        if (!t) return;
        const matches = enterScore(t, matchId, scores);
        const gf = matches.find((m) => m.side === 'grandFinal');
        set({
          tournament: { ...t, matches, isComplete: Boolean(gf?.winnerId) },
        });
      },

      reset: () => set({ tournament: null }),
    }),
    {
      name: 'camp-tennis-tournament', // localStorage key — survives offline reloads
    },
  ),
);
