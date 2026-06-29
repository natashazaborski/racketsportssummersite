import type { Match, Standing, Tournament } from '@/types';
import { BYE_ID } from './bracket';

/** How "deep" a loss is — bigger means the player lasted longer. */
function lossDepth(m: Match): number {
  if (m.side === 'grandFinal') return 1000;
  if (m.side === 'losers') return 100 + m.round;
  return m.round; // winners-bracket loss (player continues in losers bracket)
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Final standings for a completed (or in-progress) double-elim tournament.
 * Players are ranked by how far they advanced before their final loss.
 */
export function generateStandings(tournament: Tournament): Standing[] {
  const real = tournament.players.filter((p) => p.id !== BYE_ID);
  const byId = new Map(real.map((p) => [p.id, p]));

  const wins = new Map<string, number>();
  const losses = new Map<string, number>();
  const lastLossDepth = new Map<string, number>();

  for (const p of real) {
    wins.set(p.id, 0);
    losses.set(p.id, 0);
    lastLossDepth.set(p.id, 0);
  }

  let championId: string | null = null;
  for (const m of tournament.matches) {
    if (!m.winnerId || m.isBye) continue;
    if (byId.has(m.winnerId)) wins.set(m.winnerId, (wins.get(m.winnerId) ?? 0) + 1);
    if (m.side === 'grandFinal') championId = m.winnerId;
    if (m.loserId && byId.has(m.loserId)) {
      losses.set(m.loserId, (losses.get(m.loserId) ?? 0) + 1);
      lastLossDepth.set(m.loserId, Math.max(lastLossDepth.get(m.loserId) ?? 0, lossDepth(m)));
    }
  }

  // Rank by how deep a player got before their final loss (deeper = better).
  // The grand-final winner never loses, so it ranks above everyone.
  const depthOf = (id: string) =>
    id === championId ? Infinity : lastLossDepth.get(id) ?? 0;

  const ranked = [...real].sort((a, b) => {
    const diff = depthOf(b.id) - depthOf(a.id); // descending: champion first
    if (diff !== 0) return diff;
    return a.seed - b.seed; // tie-break by seed
  });

  const standings: Standing[] = [];
  let place = 0;
  let prevDepth: number | null = null;
  ranked.forEach((player, i) => {
    const depth = depthOf(player.id);
    // Players eliminated at the same depth share a place.
    if (depth !== prevDepth) place = i + 1;
    prevDepth = depth;

    let label: string;
    if (place === 1) label = 'Champion';
    else if (place === 2) label = 'Runner-up';
    else label = `${ordinal(place)} Place`;

    standings.push({
      place,
      player,
      label,
      wins: wins.get(player.id) ?? 0,
      losses: losses.get(player.id) ?? 0,
    });
  });

  return standings;
}
