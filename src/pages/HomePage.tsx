import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import CourtDiagram, { type Sport } from '@/components/CourtDiagram';
import SiteFooter from '@/components/SiteFooter';
import MobileMenu from '@/components/MobileMenu';
import '@/styles/racket.css';

/** The three sports, each linking to its own section. */
const SPORTS: { id: Sport; name: string; to: string; accent: string }[] = [
  { id: 'tennis', name: 'Tennis', to: '/tennis', accent: '#57a639' },
  { id: 'pickleball', name: 'Pickleball', to: '/pickleball', accent: '#2e9bd6' },
  { id: 'badminton', name: 'Badminton', to: '/badminton', accent: '#9e2b3a' },
];

/** Courtside home: pick a sport. Built for phones in sun. */
export default function HomePage() {
  return (
    <div className="rsc-page">
      <MobileMenu />

      <header className="rsc-header">
        <p className="rsc-eyebrow">Summer Camp · Courtside Scoring</p>
        <h1 className="rsc-title">Racket Sports Community</h1>
        <hr className="rsc-rule" />
      </header>

      <main className="rsc-panels">
        {SPORTS.map((sport) => (
          <Link
            key={sport.id}
            to={sport.to}
            className="rsc-panel"
            style={{ '--rsc-accent': sport.accent } as CSSProperties}
          >
            <CourtDiagram sport={sport.id} />
            <span className="rsc-panel-name">{sport.name}</span>
            <span className="rsc-panel-cta">Tap to enter</span>
          </Link>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
