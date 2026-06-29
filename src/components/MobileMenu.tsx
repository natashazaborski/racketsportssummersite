import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SPORTS, type Sport } from '@/lib/tournament';

const SPORT_KEYS = Object.keys(SPORTS) as Sport[];

const SUBPAGES = [
  { slug: 'tournament', label: 'Tournament' },
  { slug: 'drills', label: 'Drills & Skills' },
  { slug: 'lesson-plan', label: 'Lesson Plan and Staff Suggestions' },
];

/**
 * Mobile-only hamburger (top-left of every page). Opens a white slide-over with
 * navigation as distinct tiles — the one light surface in the dark theme.
 * Desktop keeps its own layout/nav; this is hidden via CSS above 720px.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const sport = (SPORT_KEYS as string[]).includes(segments[0])
    ? (segments[0] as Sport)
    : null;
  const subSlug = segments[1];

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  // Close on Escape, and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="rsc-burger"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {open && (
        <>
          <div className="rsc-menu-backdrop" onClick={() => setOpen(false)} />
          <nav className="rsc-menu-panel" aria-label="Site navigation">
            <div className="rsc-menu-top">
              <h2 className="rsc-menu-title">Menu</h2>
              <button
                type="button"
                className="rsc-menu-close"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <Link
              to="/"
              className={`rsc-menu-tile ${!sport ? 'is-current' : ''}`}
            >
              Home — all sports
            </Link>

            {sport && (
              <>
                <p className="rsc-menu-label">{SPORTS[sport].name}</p>
                <Link
                  to={`/${sport}`}
                  className={`rsc-menu-tile ${!subSlug ? 'is-current' : ''}`}
                  style={{ ['--rsc-accent' as string]: SPORTS[sport].accent }}
                >
                  Overview
                </Link>
                {SUBPAGES.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/${sport}/${p.slug}`}
                    className={`rsc-menu-tile ${subSlug === p.slug ? 'is-current' : ''}`}
                    style={{ ['--rsc-accent' as string]: SPORTS[sport].accent }}
                  >
                    {p.label}
                  </Link>
                ))}
              </>
            )}

            <p className="rsc-menu-label">Sports</p>
            {SPORT_KEYS.map((s) => (
              <Link
                key={s}
                to={`/${s}`}
                className={`rsc-menu-tile ${sport === s ? 'is-current' : ''}`}
                style={{ ['--rsc-accent' as string]: SPORTS[s].accent }}
              >
                {SPORTS[s].name}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
