import type { CSSProperties } from 'react';
import { NavLink, Link, Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter';
import MobileMenu from '@/components/MobileMenu';
import { SPORTS, type Sport } from '@/lib/tournament';
import '@/styles/racket.css';

export interface SportContext {
  sport: Sport;
  accent: string;
}

/** Sub-pages read their sport + accent from here. */
export function useSport(): SportContext {
  return useOutletContext<SportContext>();
}

const SUBPAGES = [
  { slug: 'tournament', label: 'Tournament' },
  { slug: 'drills', label: 'Drills & Skills' },
  { slug: 'lesson-plan', label: 'Lesson Plan and Staff Suggestions' },
];

/**
 * Frame for one sport: header + sub-nav tabs (desktop) and the shared mobile
 * menu. The sport accent is set once here and inherited by every sub-page.
 */
export default function SportLayout() {
  const { sport } = useParams();
  if (!sport || !(sport in SPORTS)) return <Navigate to="/" replace />;
  const key = sport as Sport;
  const { name, accent } = SPORTS[key];

  return (
    <div className="rsc-screen rsc-sport" style={{ '--rsc-accent': accent } as CSSProperties}>
      <MobileMenu />

      <header className="rsc-sport-head">
        <Link to="/" className="rsc-backlink rsc-sport-back">
          ← All sports
        </Link>
        <Link to={`/${key}`} className="rsc-h1 rsc-sport-name">
          {name}
        </Link>
      </header>

      <nav className="rsc-tabs rsc-subnav" aria-label={`${name} sections`}>
        {SUBPAGES.map((p) => (
          <NavLink
            key={p.slug}
            to={`/${key}/${p.slug}`}
            className={({ isActive }) => `rsc-tab ${isActive ? 'is-active' : ''}`}
          >
            {p.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ sport: key, accent } satisfies SportContext} />

      <SiteFooter />
    </div>
  );
}
