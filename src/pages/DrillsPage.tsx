import { useState } from 'react';
import { DRILLS, DRILL_CATEGORIES } from '@/data/drills';
import SiteFooter from '@/components/SiteFooter';
import '@/styles/racket.css';

/** Courtside reference of drills & skills, filterable by category. */
export default function DrillsPage() {
  const [filter, setFilter] = useState<string>('All');
  const drills = filter === 'All' ? DRILLS : DRILLS.filter((d) => d.category === filter);

  return (
    <div className="rsc-screen">
      <header className="rsc-screen-head">
        <h1 className="rsc-h1">Drills &amp; Skills</h1>
      </header>

      <div className="rsc-tabs">
        {['All', ...DRILL_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`rsc-tab ${filter === cat ? 'is-active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="rsc-card-list">
        {drills.map((d) => (
          <article key={d.id} className="rsc-card">
            <div className="rsc-drill-head">
              <h2 className="rsc-drill-name">{d.name}</h2>
              <span className="rsc-tag">{d.level}</span>
            </div>
            <p className="rsc-drill-meta">
              {d.category} • {d.duration} min
            </p>
            <p className="rsc-drill-desc">{d.description}</p>
            <ul className="rsc-cues">
              {d.cues.map((cue) => (
                <li key={cue} className="rsc-cue">
                  {cue}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}
