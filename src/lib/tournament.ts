import type { AgeGroup, Player } from '@/types';

/** Camp age groups, in program order — used across suggestions UI. */
export const AGE_GROUPS: AgeGroup[] = [
  'Wild',
  'Venture',
  'Junior High',
  'Senior High',
  'Crew',
];

/** The three sports, each with its display name and theme accent. */
export const SPORTS = {
  tennis: { name: 'Tennis', accent: '#57a639' },
  pickleball: { name: 'Pickleball', accent: '#2e9bd6' },
  badminton: { name: 'Badminton', accent: '#9e2b3a' },
} as const;

export type Sport = keyof typeof SPORTS;

/** Fixed daily time slots. A bracket instance lives in exactly one. */
export const PERIODS = [
  { id: 'p1', label: '9:00–10:30' },
  { id: 'p2', label: '10:30–12:00' },
  { id: 'p3', label: '2:00–3:30' },
  { id: 'p4', label: '3:30–5:00' },
] as const;

export type PeriodId = (typeof PERIODS)[number]['id'];

/**
 * A bracket instance is uniquely identified by sport + date + period.
 * `date` is an ISO `yyyy-mm-dd` string (local calendar day).
 */
export function instanceKey(sport: Sport, date: string, period: PeriodId): string {
  return `${sport}__${date}__${period}`;
}

/** Today's local date as `yyyy-mm-dd` (no timezone surprises). */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/** Format `yyyy-mm-dd` as e.g. "MON 29 JUN 2026" for the header corner. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${DAYS[date.getDay()]} ${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

/** Placeholder roster so a bracket can be previewed before real attendance. */
export function placeholderNames(count = 8): string[] {
  return Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
}

const uid = () =>
  crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Turn a name list into seeded players (input order = seed order). */
export function makePlayers(names: string[]): Player[] {
  return names
    .map((n) => n.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: uid(), name, seed: i + 1 }));
}
