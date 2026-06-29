import { useMemo, useState } from 'react';
import { DRILL_LEVELS, type DrillLevel } from '@/data/drills';
import { useContentStore } from '@/store/contentStore';
import { useSport } from '@/components/SportLayout';

/** Per-sport drills & skills reference, filterable, with an add-drill form. */
export default function SportDrillsPage() {
  const { sport } = useSport();
  const drills = useContentStore((s) => s.drills[sport]);
  const addDrill = useContentStore((s) => s.addDrill);

  const [filter, setFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);

  // New-drill form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState<DrillLevel>('Beginner');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  const categories = useMemo(
    () => [...new Set(drills.map((d) => d.category))].sort(),
    [drills],
  );
  const shown = filter === 'All' ? drills : drills.filter((d) => d.category === filter);

  const resetForm = () => {
    setName('');
    setCategory('');
    setDuration('');
    setLevel('Beginner');
    setDescription('');
    setTags('');
    setError('');
  };

  const submit = () => {
    if (!name.trim() || !category.trim() || !description.trim()) {
      setError('Add a name, a category, and a description to save.');
      return;
    }
    addDrill(sport, {
      name: name.trim(),
      category: category.trim(),
      duration: Math.max(1, Number(duration) || 10),
      level,
      description: description.trim(),
      cues: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    resetForm();
    setFormOpen(false);
    setFilter('All');
  };

  return (
    <div>
      <div className="rsc-toolbar">
        <h2 className="rsc-col-head" style={{ marginBottom: 0 }}>
          Drills &amp; Skills
        </h2>
        <button
          type="button"
          className="rsc-btn"
          onClick={() => {
            if (formOpen) setFormOpen(false);
            else {
              resetForm();
              setFormOpen(true);
            }
          }}
        >
          {formOpen ? 'Close' : 'New drill'}
        </button>
      </div>

      {formOpen && (
        <div className="rsc-card rsc-form">
          {error && <p className="rsc-form-error">{error}</p>}
          <div className="rsc-field">
            <label className="rsc-label" htmlFor="dr-name">Name</label>
            <input
              id="dr-name"
              className="rsc-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Drill name"
            />
          </div>
          <div className="rsc-form-grid">
            <div className="rsc-field">
              <label className="rsc-label" htmlFor="dr-cat">Category</label>
              <input
                id="dr-cat"
                className="rsc-input"
                list="dr-cat-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Footwork"
              />
              <datalist id="dr-cat-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="rsc-field">
              <label className="rsc-label" htmlFor="dr-dur">Duration (min)</label>
              <input
                id="dr-dur"
                className="rsc-input"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="rsc-field">
              <label className="rsc-label" htmlFor="dr-level">Difficulty</label>
              <select
                id="dr-level"
                className="rsc-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as DrillLevel)}
              >
                {DRILL_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="rsc-field">
            <label className="rsc-label" htmlFor="dr-desc">Description</label>
            <textarea
              id="dr-desc"
              className="rsc-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How the drill runs."
            />
          </div>
          <div className="rsc-field">
            <label className="rsc-label" htmlFor="dr-tags">Tags (comma-separated)</label>
            <input
              id="dr-tags"
              className="rsc-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Watch the ball, Stay low"
            />
          </div>
          <div className="rsc-form-actions">
            <button type="button" className="rsc-btn" onClick={submit}>
              Save drill
            </button>
            <button
              type="button"
              className="rsc-btn-ghost"
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rsc-tabs">
        {['All', ...categories].map((cat) => (
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

      {shown.length === 0 ? (
        <p className="rsc-empty">
          No drills yet{filter !== 'All' ? ` in ${filter}` : ''}. Add one to get started.
        </p>
      ) : (
        <div className="rsc-card-list">
          {shown.map((d) => (
            <article key={d.id} className="rsc-card">
              <div className="rsc-drill-head">
                <h3 className="rsc-drill-name">{d.name}</h3>
                <span className="rsc-tag">{d.level}</span>
              </div>
              <p className="rsc-drill-meta">
                {d.category} • {d.duration} min
              </p>
              <p className="rsc-drill-desc">{d.description}</p>
              {d.cues.length > 0 && (
                <ul className="rsc-cues">
                  {d.cues.map((cue) => (
                    <li key={cue} className="rsc-cue">{cue}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
