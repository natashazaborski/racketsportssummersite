import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter';
import '@/styles/racket.css';

/** The five camp age groups, in program order. */
const AGE_GROUPS = ['Wild', 'Venture', 'Junior High', 'Senior High', 'Crew'] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

interface Suggestion {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  text: string;
  /** Excerpt the staff member highlighted from the lesson plan, if any. */
  referenced?: string;
}

/**
 * Lesson plan SOP sections. Content is uploaded later — for now these are
 * empty headers. Each section can take an array of bullet items (with optional
 * sub-items) so real content drops in without restructuring the page.
 */
interface LessonItem {
  text: string;
  sub?: string[];
}
interface LessonSection {
  title: string;
  items: LessonItem[];
}
const LESSON_SECTIONS: LessonSection[] = [
  { title: 'Rules / Safety', items: [] },
  { title: 'Introduction / Warm Up', items: [] },
  { title: 'Time Breakdown', items: [] },
  { title: 'Skill Focus', items: [] },
  { title: 'Games / Sizzle', items: [] },
  { title: 'Cool Down / Wrap Up', items: [] },
];

const SEED_SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    name: 'Maya R.',
    ageGroup: 'Wild',
    text: 'Open every session with a quick name-and-move game so the youngest campers settle in before we pick up racquets.',
  },
  {
    id: 's2',
    name: 'Devon K.',
    ageGroup: 'Junior High',
    text: 'Run a king-of-the-court rotation during the games block — it keeps a big group moving and competitive without anyone sitting out.',
    referenced: 'Games / Sizzle',
  },
  {
    id: 's3',
    name: 'Priya S.',
    ageGroup: 'Senior High',
    text: 'Give serve mechanics more time. Older campers want to hit hard but the toss falls apart under pressure.',
    referenced: 'Allow 10 minutes for serve targets during the time breakdown.',
  },
  {
    id: 's4',
    name: 'Coach Alex',
    ageGroup: 'Crew',
    text: 'Keep the first-aid kit and water jug courtside at all times, and brief one staffer each day to own safety checks.',
  },
];

export default function LessonPlanPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SEED_SUGGESTIONS);
  const [filter, setFilter] = useState<AgeGroup | 'All'>('All');
  const [formOpen, setFormOpen] = useState(false);

  // New-suggestion form fields
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [text, setText] = useState('');
  const [referenced, setReferenced] = useState('');
  const [error, setError] = useState('');

  // Floating "Reference" button driven by text selection in the lesson column
  const lessonRef = useRef<HTMLDivElement>(null);
  const selectedText = useRef('');
  const [refBtn, setRefBtn] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const hide = () => setRefBtn(null);

    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return hide();
      const value = sel.toString().trim();
      if (!value) return hide();
      const range = sel.getRangeAt(0);
      const container = lessonRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) return hide();
      const rect = range.getBoundingClientRect();
      selectedText.current = value;
      setRefBtn({ x: rect.left + rect.width / 2, y: rect.top });
    };

    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) hide();
    };

    document.addEventListener('mouseup', update);
    document.addEventListener('keyup', update);
    // Hide while scrolling — the button is fixed and would drift off the text.
    window.addEventListener('scroll', hide, true);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('mouseup', update);
      document.removeEventListener('keyup', update);
      window.removeEventListener('scroll', hide, true);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

  const openForReference = () => {
    setReferenced(selectedText.current);
    setFormOpen(true);
    setRefBtn(null);
    window.getSelection()?.removeAllRanges();
  };

  const resetForm = () => {
    setName('');
    setAgeGroup('');
    setText('');
    setReferenced('');
    setError('');
  };

  const submit = () => {
    if (!name.trim() || !ageGroup || !text.trim()) {
      setError('Add a name, an age group, and a suggestion to save.');
      return;
    }
    setSuggestions((prev) => [
      {
        id: `s${Date.now()}`,
        name: name.trim(),
        ageGroup: ageGroup as AgeGroup,
        text: text.trim(),
        referenced: referenced.trim() || undefined,
      },
      ...prev,
    ]);
    resetForm();
    setFormOpen(false);
  };

  const visible =
    filter === 'All' ? suggestions : suggestions.filter((s) => s.ageGroup === filter);

  return (
    <div className="rsc-screen">
      <header className="rsc-screen-head">
        <Link to="/" className="rsc-backlink">
          ← Racket Sports Community
        </Link>
        <h1 className="rsc-h1">Lesson Plan and Staff Suggestions</h1>
      </header>

      <div className="rsc-two-col">
        {/* LEFT — Lesson plan (read-only reference) */}
        <section>
          <h2 className="rsc-col-head">Lesson Plan</h2>
          <p className="rsc-col-sub">
            Reference document. Highlight any line to attach it to a suggestion.
          </p>
          <div className="rsc-lesson" ref={lessonRef}>
            {LESSON_SECTIONS.map((section) => (
              <div key={section.title} className="rsc-lesson-section">
                <h3 className="rsc-section-head">{section.title}</h3>
                <div className="rsc-lesson-body">
                  {section.items.length === 0 ? (
                    <p className="rsc-lesson-placeholder">
                      Lesson content will be added here.
                    </p>
                  ) : (
                    <ul className="rsc-lesson-list">
                      {section.items.map((item, i) => (
                        <li key={i}>
                          {item.text}
                          {item.sub && (
                            <ul className="rsc-lesson-list">
                              {item.sub.map((s, j) => (
                                <li key={j}>{s}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT — Staff suggestions */}
        <section>
          <div className="rsc-toolbar">
            <h2 className="rsc-col-head" style={{ marginBottom: 0 }}>
              Staff Suggestions
            </h2>
            <button
              type="button"
              className="rsc-btn"
              onClick={() => {
                if (formOpen) {
                  setFormOpen(false);
                } else {
                  resetForm();
                  setFormOpen(true);
                }
              }}
            >
              {formOpen ? 'Close' : 'New suggestion'}
            </button>
          </div>

          {formOpen && (
            <div className="rsc-card rsc-form">
              {error && <p className="rsc-form-error">{error}</p>}
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-name">
                  Name
                </label>
                <input
                  id="sug-name"
                  className="rsc-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Staff member"
                />
              </div>
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-age">
                  Age group
                </label>
                <select
                  id="sug-age"
                  className="rsc-select"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                >
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-text">
                  Suggestion
                </label>
                <textarea
                  id="sug-text"
                  className="rsc-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What should staff try, change, or watch out for?"
                />
              </div>
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-ref">
                  Referenced from lesson plan (optional)
                </label>
                <input
                  id="sug-ref"
                  className="rsc-input"
                  value={referenced}
                  onChange={(e) => setReferenced(e.target.value)}
                  placeholder="Highlight lesson text, or type a reference here"
                />
              </div>
              <div className="rsc-form-actions">
                <button type="button" className="rsc-btn" onClick={submit}>
                  Save suggestion
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
            {(['All', ...AGE_GROUPS] as const).map((g) => (
              <button
                key={g}
                type="button"
                className={`rsc-tab ${filter === g ? 'is-active' : ''}`}
                onClick={() => setFilter(g)}
              >
                {g}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rsc-empty">No suggestions for {filter} yet.</p>
          ) : (
            <div className="rsc-card-list">
              {visible.map((s) => (
                <article key={s.id} className="rsc-card">
                  <div className="rsc-sugg-head">
                    <h3 className="rsc-sugg-name">{s.name}</h3>
                    <span className="rsc-tag">{s.ageGroup}</span>
                  </div>
                  <p className="rsc-sugg-text">{s.text}</p>
                  {s.referenced && (
                    <div className="rsc-quote">
                      <span className="rsc-quote-label">From the lesson plan</span>
                      <span className="rsc-quote-text">{s.referenced}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <SiteFooter />

      {refBtn && (
        <button
          type="button"
          className="rsc-ref-btn"
          style={{ left: refBtn.x, top: refBtn.y }}
          // Keep the selection alive through the click so we can read it.
          onMouseDown={(e) => e.preventDefault()}
          onClick={openForReference}
        >
          Reference
        </button>
      )}
    </div>
  );
}
