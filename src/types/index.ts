// Core domain types shared across the app.

export interface Player {
  id: string;
  name: string;
  /** Seed (1 = top seed). Used to place players in the bracket. */
  seed: number;
}

/** Which half of a double-elimination bracket a match lives in. */
export type BracketSide = 'winners' | 'losers' | 'grandFinal';

export interface MatchSlot {
  /** Player id, or null when the feeding match isn't decided yet. */
  playerId: string | null;
  /** Games/points won by this slot, entered by a counselor. */
  score: number | null;
}

export interface Match {
  id: string;
  side: BracketSide;
  /** Round number within the given side (1-based). */
  round: number;
  /** Display order of the match within its round (0-based). */
  order: number;
  slots: [MatchSlot, MatchSlot];
  /** Match id that the WINNER advances into (and which slot). */
  winnerTo: { matchId: string; slot: 0 | 1 } | null;
  /** Match id that the LOSER drops into (winners-bracket only). */
  loserTo: { matchId: string; slot: 0 | 1 } | null;
  /** Resolved once both scores are entered. */
  winnerId: string | null;
  loserId: string | null;
  /** A bye auto-advances slot 0 and needs no score entry. */
  isBye: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  players: Player[];
  matches: Match[];
  /** True once the grand final is decided. */
  isComplete: boolean;
}

export interface Standing {
  place: number;
  player: Player;
  /** e.g. "Champion", "Runner-up", "3rd Place". */
  label: string;
  wins: number;
  losses: number;
}

/** Camp age groups a staff suggestion can be filed under. */
export type AgeGroup = 'Wild' | 'Venture' | 'Junior High' | 'Senior High' | 'Crew';

export interface Suggestion {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  text: string;
  /** Excerpt the staff member highlighted from the lesson plan, if any. */
  referenced?: string;
}
