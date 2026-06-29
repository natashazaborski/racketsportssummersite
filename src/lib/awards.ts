import type { Standing, Tournament } from '@/types';
import { generateStandings } from './standings';

export interface Award {
  id: string;
  /** Recipient's display name. */
  recipient: string;
  /** e.g. "Champion", "Most Improved". */
  title: string;
  /** Supporting line printed under the title. */
  subtitle: string;
  /** Emoji/icon shown on the printed certificate. */
  icon: string;
}

/**
 * Build the list of printable awards from tournament results.
 * Placement medals come straight from the standings; participation and
 * superlative awards round out the ceremony.
 */
export function generateAwards(tournament: Tournament): Award[] {
  const standings = generateStandings(tournament);
  const awards: Award[] = [];

  const medalFor = (s: Standing): { icon: string; title: string } => {
    if (s.place === 1) return { icon: '🏆', title: 'Champion' };
    if (s.place === 2) return { icon: '🥈', title: 'Runner-up' };
    if (s.place === 3) return { icon: '🥉', title: 'Third Place' };
    return { icon: '🎾', title: `${s.label}` };
  };

  // Placement awards for the podium.
  for (const s of standings.filter((x) => x.place <= 3)) {
    const { icon, title } = medalFor(s);
    awards.push({
      id: `place-${s.player.id}`,
      recipient: s.player.name,
      title,
      subtitle: `${tournament.name} • ${s.wins}–${s.losses} record`,
      icon,
    });
  }

  // Superlative: most match wins.
  const mostWins = [...standings].sort((a, b) => b.wins - a.wins)[0];
  if (mostWins && mostWins.wins > 0) {
    awards.push({
      id: `most-wins-${mostWins.player.id}`,
      recipient: mostWins.player.name,
      title: 'Most Match Wins',
      subtitle: `${mostWins.wins} wins at ${tournament.name}`,
      icon: '🔥',
    });
  }

  // Participation certificate for everyone — great for camp.
  for (const s of standings) {
    awards.push({
      id: `participation-${s.player.id}`,
      recipient: s.player.name,
      title: 'Certificate of Participation',
      subtitle: `Thanks for playing in ${tournament.name}!`,
      icon: '🎉',
    });
  }

  return awards;
}
