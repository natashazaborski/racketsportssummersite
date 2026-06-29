import { Link } from 'react-router-dom';
import CourtDiagram from '@/components/CourtDiagram';
import { SPORTS } from '@/lib/tournament';
import { useSport } from '@/components/SportLayout';

const SECTIONS = [
  {
    slug: 'tournament',
    label: 'Tournament',
    desc: 'Run the double-elimination bracket by date and period.',
  },
  {
    slug: 'drills',
    label: 'Drills & Skills',
    desc: 'Browse and add drills for this sport.',
  },
  {
    slug: 'lesson-plan',
    label: 'Lesson Plan and Staff Suggestions',
    desc: 'Reference the plan and log staff suggestions.',
  },
];

/** Sport landing page: pick a section to work in. */
export default function SportOverview() {
  const { sport } = useSport();
  const { name } = SPORTS[sport];

  return (
    <div>
      <div className="rsc-ov-hero">
        <CourtDiagram sport={sport} />
        <p className="rsc-ov-tagline">
          {name} at camp — choose a section to get started.
        </p>
      </div>

      <div className="rsc-ov-tiles">
        {SECTIONS.map((s) => (
          <Link key={s.slug} to={`/${sport}/${s.slug}`} className="rsc-ov-tile">
            <span className="rsc-ov-tile-label">{s.label}</span>
            <span className="rsc-ov-tile-desc">{s.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
