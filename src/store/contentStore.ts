import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Drill } from '@/data/drills';
import { DRILLS } from '@/data/drills';
import type { Suggestion } from '@/types';
import type { Sport } from '@/lib/tournament';

const uid = () =>
  crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Tennis ships with the existing seed content; other sports start empty. */
const TENNIS_SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    name: 'Maya R.',
    ageGroup: 'Wild',
    text: 'Open every session with a quick name-and-move game so the youngest campers settle in before we pick up racquets.',
  },
  {
    id: 's2',
    name: 'Devon K.',
    ageGroup: 'Junior High',
    text: 'Run a king-of-the-court rotation during the games block — it keeps a big group moving and competitive without anyone sitting out.',
    referenced: 'Games / Sizzle',
  },
  {
    id: 's3',
    name: 'Priya S.',
    ageGroup: 'Senior High',
    text: 'Give serve mechanics more time. Older campers want to hit hard but the toss falls apart under pressure.',
    referenced: 'Allow 10 minutes for serve targets during the time breakdown.',
  },
  {
    id: 's4',
    name: 'Coach Alex',
    ageGroup: 'Crew',
    text: 'Keep the first-aid kit and water jug courtside at all times, and brief one staffer each day to own safety checks.',
  },
];

type BySport<T> = Record<Sport, T>;

interface ContentState {
  drills: BySport<Drill[]>;
  suggestions: BySport<Suggestion[]>;
  addDrill: (sport: Sport, drill: Omit<Drill, 'id'>) => void;
  addSuggestion: (sport: Sport, suggestion: Omit<Suggestion, 'id'>) => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      drills: {
        tennis: DRILLS,
        pickleball: [],
        badminton: [],
      },
      suggestions: {
        tennis: TENNIS_SUGGESTIONS,
        pickleball: [],
        badminton: [],
      },

      addDrill: (sport, drill) =>
        set((s) => ({
          drills: { ...s.drills, [sport]: [{ ...drill, id: uid() }, ...s.drills[sport]] },
        })),

      addSuggestion: (sport, suggestion) =>
        set((s) => ({
          suggestions: {
            ...s.suggestions,
            [sport]: [{ ...suggestion, id: uid() }, ...s.suggestions[sport]],
          },
        })),
    }),
    {
      name: 'racket-content', // localStorage — drills + suggestions per sport
    },
  ),
);
