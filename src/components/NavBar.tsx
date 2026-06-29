import { NavLink } from 'react-router-dom';
import '@/styles/racket.css';

const TABS = [
  { to: '/', label: 'Home' },
  { to: '/bracket', label: 'Bracket' },
  { to: '/standings', label: 'Places' },
  { to: '/drills', label: 'Drills' },
  { to: '/awards', label: 'Awards' },
];

/** Fixed bottom navigation — flat dark bar with condensed text labels. */
export default function NavBar() {
  return (
    <nav className="no-print rsc-nav">
      <div className="rsc-nav-inner">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `rsc-nav-link ${isActive ? 'is-active' : ''}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
