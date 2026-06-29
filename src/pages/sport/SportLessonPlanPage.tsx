import { useEffect, useRef, useState } from 'react';
import type { AgeGroup } from '@/types';
import { AGE_GROUPS } from '@/lib/tournament';
import { LESSON_PLANS, LESSON_PLAN_META } from '@/data/lessonPlan';
import { useContentStore } from '@/store/contentStore';
import { useSport } from '@/components/SportLayout';

/**
 * Per-sport lesson plan (read-only reference) paired with that sport's own
 * staff suggestions. Highlighting lesson text attaches it to a new suggestion.
 */
export default function SportLessonPlanPage() {
  const { sport } = useSport();
  const suggestions = useContentStore((s) => s.suggestions[sport]);
  const addSuggestion = useContentStore((s) => s.addSuggestion);

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
    addSuggestion(sport, {
      name: name.trim(),
      ageGroup: ageGroup as AgeGroup,
      text: text.trim(),
      referenced: referenced.trim() || undefined,
    });
    resetForm();
    setFormOpen(false);
  };

  const visible =
    filter === 'All' ? suggestions : suggestions.filter((s) => s.ageGroup === filter);

  const sections = LESSON_PLANS[sport];

  return (
    <div>
      <div className="rsc-two-col">
        {/* LEFT — Lesson plan (read-only reference) */}
        <section>
          <h2 className="rsc-col-head">Lesson Plan</h2>
          <p className="rsc-lesson-meta">{LESSON_PLAN_META}</p>
          <p className="rsc-col-sub">
            Reference document. Highlight any line to attach it to a suggestion.
          </p>
          <div className="rsc-lesson" ref={lessonRef}>
            {sections.map((section) => (
              <div key={section.title} className="rsc-lesson-section">
                <h3 className="rsc-section-head">
                  {section.title} — {section.duration}
                </h3>
                <div className="rsc-lesson-body">
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
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT — Staff suggestions (scoped to this sport) */}
        <section>
          <div className="rsc-toolbar">
            <h2 className="rsc-col-head" style={{ marginBottom: 0 }}>
              Staff Suggestions
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
              {formOpen ? 'Close' : 'New suggestion'}
            </button>
          </div>

          {formOpen && (
            <div className="rsc-card rsc-form">
              {error && <p className="rsc-form-error">{error}</p>}
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-name">Name</label>
                <input
                  id="sug-name"
                  className="rsc-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Staff member"
                />
              </div>
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-age">Age group</label>
                <select
                  id="sug-age"
                  className="rsc-select"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                >
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="rsc-field">
                <label className="rsc-label" htmlFor="sug-text">Suggestion</label>
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

      {refBtn && (
        <button
          type="button"
          className="rsc-ref-btn"
          style={{ left: refBtn.x, top: refBtn.y }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={openForReference}
        >
          Reference
        </button>
      )}
    </div>
  );
}
