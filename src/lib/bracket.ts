import type { Match, Player, Tournament } from '@/types';

/**
 * Sentinel id used to pad a bracket out to a power of two.
 * A real player facing a BYE auto-advances with no score entry.
 */
export const BYE_ID = '__BYE__';

const nextPow2 = (n: number) => {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
};

/**
 * Standard tournament seeding order for a bracket of `size` slots.
 * Returns seed numbers (1-based) in bracket position order so that
 * seed 1 meets the weakest opponent, 1 & 2 can only meet in the final, etc.
 */
function seedOrder(size: number): number[] {
  let seeds = [1];
  while (seeds.length < size) {
    const sum = seeds.length * 2 + 1;
    const next: number[] = [];
    for (const s of seeds) {
      next.push(s);
      next.push(sum - s);
    }
    seeds = next;
  }
  return seeds;
}

const winnersId = (round: number, order: number) => `W-${round}-${order}`;
const losersId = (round: number, order: number) => `L-${round}-${order}`;
const GRAND_FINAL_ID = 'GF';
/** Second grand final — only played if the losers finalist wins the first. */
const GRAND_FINAL_RESET_ID = 'GF2';

function emptySlot() {
  return { playerId: null as string | null, score: null as number | null };
}

/**
 * Build a complete double-elimination bracket from a seeded player list.
 * Byes are auto-resolved so the first real matches are ready to play.
 */
export function buildDoubleElimination(players: Player[]): Match[] {
  const size = Math.max(4, nextPow2(players.length));
  const k = Math.log2(size);
  const order = seedOrder(size);

  // Position -> Player or BYE
  const bySeed = new Map(players.map((p) => [p.seed, p]));
  const positioned: string[] = order.map((seed) => bySeed.get(seed)?.id ?? BYE_ID);

  const matches = new Map<string, Match>();

  // ---- Winners bracket ----
  for (let round = 1; round <= k; round++) {
    const count = size / 2 ** round;
    for (let o = 0; o < count; o++) {
      matches.set(winnersId(round, o), {
        id: winnersId(round, o),
        side: 'winners',
        round,
        order: o,
        slots: [emptySlot(), emptySlot()],
        winnerTo: null,
        loserTo: null,
        winnerId: null,
        loserId: null,
        isBye: false,
      });
    }
  }

  // Seat WR1
  for (let o = 0; o < size / 2; o++) {
    const m = matches.get(winnersId(1, o))!;
    m.slots[0].playerId = positioned[o * 2];
    m.slots[1].playerId = positioned[o * 2 + 1];
  }

  // ---- Losers bracket round sizes ----
  const lbRounds = Math.max(0, 2 * k - 2);
  const lbCounts: number[] = [];
  for (let j = 1; j <= lbRounds; j++) {
    if (j === 1) lbCounts.push(size / 4);
    else if (j % 2 === 0) lbCounts.push(lbCounts[j - 2]); // major: receives WB drops
    else lbCounts.push(lbCounts[j - 2] / 2); // minor: pairs LB winners
  }
  for (let j = 1; j <= lbRounds; j++) {
    for (let o = 0; o < lbCounts[j - 1]; o++) {
      matches.set(losersId(j, o), {
        id: losersId(j, o),
        side: 'losers',
        round: j,
        order: o,
        slots: [emptySlot(), emptySlot()],
        winnerTo: null,
        loserTo: null,
        winnerId: null,
        loserId: null,
        isBye: false,
      });
    }
  }

  // ---- Grand final (+ reset match) ----
  matches.set(GRAND_FINAL_ID, {
    id: GRAND_FINAL_ID,
    side: 'grandFinal',
    round: 1,
    order: 0,
    slots: [emptySlot(), emptySlot()],
    winnerTo: null,
    loserTo: null,
    winnerId: null,
    loserId: null,
    isBye: false,
  });
  // GF2 is seated lazily by applyGrandFinalReset only when a reset is required.
  matches.set(GRAND_FINAL_RESET_ID, {
    id: GRAND_FINAL_RESET_ID,
    side: 'grandFinal',
    round: 2,
    order: 0,
    slots: [emptySlot(), emptySlot()],
    winnerTo: null,
    loserTo: null,
    winnerId: null,
    loserId: null,
    isBye: false,
  });

  // ---- Wire winners-bracket advancement + loser drops ----
  for (let round = 1; round <= k; round++) {
    const count = size / 2 ** round;
    for (let o = 0; o < count; o++) {
      const m = matches.get(winnersId(round, o))!;
      // Winner advances
      if (round < k) {
        m.winnerTo = { matchId: winnersId(round + 1, o >> 1), slot: (o % 2) as 0 | 1 };
      } else {
        m.winnerTo = { matchId: GRAND_FINAL_ID, slot: 0 };
      }
      // Loser drops into losers bracket
      if (round === 1) {
        m.loserTo = { matchId: losersId(1, o >> 1), slot: (o % 2) as 0 | 1 };
      } else {
        m.loserTo = { matchId: losersId(2 * round - 2, o), slot: 1 };
      }
    }
  }

  // ---- Wire losers-bracket advancement ----
  for (let j = 1; j <= lbRounds; j++) {
    const count = lbCounts[j - 1];
    for (let o = 0; o < count; o++) {
      const m = matches.get(losersId(j, o))!;
      if (j === lbRounds) {
        m.winnerTo = { matchId: GRAND_FINAL_ID, slot: 1 };
      } else {
        const nextCount = lbCounts[j];
        if (nextCount === count) {
          // Next round is major (same size): winners feed slot 0, drops fill slot 1.
          m.winnerTo = { matchId: losersId(j + 1, o), slot: 0 };
        } else {
          // Next round is minor (half size): pair up adjacent winners.
          m.winnerTo = { matchId: losersId(j + 1, o >> 1), slot: (o % 2) as 0 | 1 };
        }
      }
    }
  }

  const list = [...matches.values()];
  finalize(list);
  return list;
}

/** True once both slots are filled (by a player or a BYE). */
function bothSeated(m: Match): boolean {
  return m.slots[0].playerId !== null && m.slots[1].playerId !== null;
}

/**
 * Decide a single match if possible (scores entered, or a BYE present).
 * Returns true if it newly resolved.
 */
function tryResolve(m: Match, byId: Map<string, Match>): boolean {
  if (m.winnerId || !bothSeated(m)) return false;
  const [a, b] = m.slots;
  const aBye = a.playerId === BYE_ID;
  const bBye = b.playerId === BYE_ID;

  let winnerSlot: 0 | 1 | null = null;
  if (aBye && bBye) {
    m.isBye = true;
    m.winnerId = BYE_ID;
    m.loserId = BYE_ID;
    push(m, byId);
    return true;
  } else if (bBye) {
    m.isBye = true;
    winnerSlot = 0;
  } else if (aBye) {
    m.isBye = true;
    winnerSlot = 1;
  } else if (a.score !== null && b.score !== null && a.score !== b.score) {
    winnerSlot = a.score > b.score ? 0 : 1;
  }

  if (winnerSlot === null) return false;
  const loserSlot = (winnerSlot === 0 ? 1 : 0) as 0 | 1;
  m.winnerId = m.slots[winnerSlot].playerId;
  m.loserId = m.slots[loserSlot].playerId;
  push(m, byId);
  return true;
}

/** Send a resolved match's winner/loser into their destination slots. */
function push(m: Match, byId: Map<string, Match>) {
  if (m.winnerTo && m.winnerId) {
    byId.get(m.winnerTo.matchId)!.slots[m.winnerTo.slot].playerId = m.winnerId;
  }
  if (m.loserTo && m.loserId) {
    byId.get(m.loserTo.matchId)!.slots[m.loserTo.slot].playerId = m.loserId;
  }
}

/** Repeatedly resolve until the bracket is stable (handles bye cascades). */
export function resolveAll(matches: Match[]): void {
  const byId = new Map(matches.map((m) => [m.id, m]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of matches) {
      if (tryResolve(m, byId)) changed = true;
    }
  }
}

/**
 * Seat (or clear) the bracket-reset final. A reset is only required when the
 * losers-bracket finalist (grand-final slot 1) beats the winners-bracket
 * champion (slot 0) in the first grand final — then both have one loss and a
 * deciding match is played. Otherwise GF2 stays empty.
 */
function applyGrandFinalReset(matches: Match[]): void {
  const byId = new Map(matches.map((m) => [m.id, m]));
  const gf = byId.get(GRAND_FINAL_ID);
  const gf2 = byId.get(GRAND_FINAL_RESET_ID);
  if (!gf || !gf2) return;

  const wbChamp = gf.slots[0].playerId;
  const lbChamp = gf.slots[1].playerId;
  const resetNeeded =
    !!gf.winnerId && gf.winnerId !== BYE_ID && !!wbChamp && !!lbChamp && gf.winnerId === lbChamp;

  if (resetNeeded) {
    const sameMatchup = gf2.slots[0].playerId === wbChamp && gf2.slots[1].playerId === lbChamp;
    if (!sameMatchup) {
      // New (or first) reset matchup — seat finalists and drop any stale score.
      gf2.slots[0] = { playerId: wbChamp, score: null };
      gf2.slots[1] = { playerId: lbChamp, score: null };
      gf2.winnerId = null;
      gf2.loserId = null;
      gf2.isBye = false;
    }
  } else if (gf2.slots[0].playerId !== null || gf2.slots[1].playerId !== null) {
    // No reset (or GF undecided) — wipe the reset match.
    gf2.slots[0] = { playerId: null, score: null };
    gf2.slots[1] = { playerId: null, score: null };
    gf2.winnerId = null;
    gf2.loserId = null;
    gf2.isBye = false;
  }
}

/** Resolve the bracket, then seat the reset final and resolve it too. */
function finalize(matches: Match[]): void {
  resolveAll(matches);
  applyGrandFinalReset(matches);
  resolveAll(matches);
}

/**
 * The tournament champion's id, or null if undecided. The title is settled
 * when the winners champion takes the first grand final, or when the reset
 * final is decided.
 */
export function championId(matches: Match[]): string | null {
  const gf = matches.find((m) => m.id === GRAND_FINAL_ID);
  const gf2 = matches.find((m) => m.id === GRAND_FINAL_RESET_ID);
  if (!gf?.winnerId || gf.winnerId === BYE_ID) return null;
  // GF2 seated -> a reset is in play; the title follows GF2.
  if (gf2 && gf2.slots[0].playerId !== null) {
    return gf2.winnerId && gf2.winnerId !== BYE_ID ? gf2.winnerId : null;
  }
  return gf.winnerId;
}

/** True once the champion is decided. */
export function isTournamentComplete(matches: Match[]): boolean {
  return championId(matches) !== null;
}

/**
 * Record a score for a match in a bracket, then re-run progression so the
 * bracket advances automatically. Returns a new match list (input untouched).
 */
export function scoreMatch(
  matches: Match[],
  matchId: string,
  scores: [number, number],
): Match[] {
  const clone: Match[] = matches.map((m) => ({
    ...m,
    slots: [{ ...m.slots[0] }, { ...m.slots[1] }] as Match['slots'],
  }));
  const byId = new Map(clone.map((m) => [m.id, m]));
  const target = byId.get(matchId);
  if (!target) return clone;

  target.slots[0].score = scores[0];
  target.slots[1].score = scores[1];
  // Allow re-deciding a match: clear this match's own result (so a flipped
  // winner is recomputed) and wipe the stale results it pushed downstream.
  target.winnerId = null;
  target.loserId = null;
  target.isBye = false;
  clearFrom(target, byId);
  finalize(clone);
  return clone;
}

/** Legacy wrapper kept for the single-tournament store. */
export function enterScore(
  tournament: Tournament,
  matchId: string,
  scores: [number, number],
): Match[] {
  return scoreMatch(tournament.matches, matchId, scores);
}

/**
 * If a match is being re-scored, wipe the players/scores it previously
 * pushed downstream so the bracket can be recomputed cleanly.
 */
function clearFrom(m: Match, byId: Map<string, Match>) {
  const visited = new Set<string>();
  const wipe = (match: Match) => {
    if (visited.has(match.id)) return;
    visited.add(match.id);
    for (const link of [match.winnerTo, match.loserTo]) {
      if (!link) continue;
      const next = byId.get(link.matchId)!;
      next.slots[link.slot] = { playerId: null, score: null };
      next.winnerId = null;
      next.loserId = null;
      next.isBye = false;
      wipe(next);
    }
  };
  wipe(m);
}

export const isBye = (playerId: string | null) => playerId === BYE_ID;
