import { useRef, useState } from 'react';
import { extractNamesFromPdf } from '@/lib/pdf';

interface Props {
  /** Called with the reviewed roster once the user confirms. */
  onConfirm: (names: string[]) => void;
}

type Phase = 'idle' | 'parsing' | 'review' | 'error';

/**
 * Upload an attendance PDF, extract names, and let the user fix misreads
 * before confirming the roster for a bracket instance.
 */
export default function AttendanceUpload({ onConfirm }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [names, setNames] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setPhase('parsing');
    setMessage('');
    try {
      const extracted = await extractNamesFromPdf(file);
      if (extracted.length === 0) {
        setNames(['']);
        setMessage("Couldn't find any names automatically — add them by hand below.");
      } else {
        setNames(extracted);
      }
      setPhase('review');
    } catch {
      setPhase('error');
      setMessage('That PDF could not be read. Try another file, or enter names by hand.');
    }
  };

  const editName = (i: number, value: string) =>
    setNames((list) => list.map((n, idx) => (idx === i ? value : n)));
  const removeName = (i: number) =>
    setNames((list) => list.filter((_, idx) => idx !== i));
  const addName = () => setNames((list) => [...list, '']);

  const confirm = () => {
    const cleaned = names.map((n) => n.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      setMessage('Add at least two players to build a bracket.');
      return;
    }
    onConfirm(cleaned);
  };

  if (phase === 'review') {
    const valid = names.map((n) => n.trim()).filter(Boolean).length;
    return (
      <div className="rsc-card rsc-attend">
        <div className="rsc-attend-head">
          <h3 className="rsc-attend-title">Review roster</h3>
          <span className="rsc-attend-count">{valid} players</span>
        </div>
        {message && <p className="rsc-form-error">{message}</p>}
        <ul className="rsc-attend-list">
          {names.map((name, i) => (
            <li key={i} className="rsc-attend-row">
              <span className="rsc-attend-seed">{i + 1}</span>
              <input
                className="rsc-input"
                value={name}
                placeholder="Player name"
                onChange={(e) => editName(i, e.target.value)}
              />
              <button
                type="button"
                className="rsc-attend-remove"
                aria-label={`Remove ${name || 'player'}`}
                onClick={() => removeName(i)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="rsc-form-actions">
          <button type="button" className="rsc-btn" onClick={confirm}>
            Confirm roster
          </button>
          <button type="button" className="rsc-btn-ghost" onClick={addName}>
            Add player
          </button>
          <button
            type="button"
            className="rsc-btn-ghost"
            onClick={() => {
              setPhase('idle');
              setNames([]);
              setMessage('');
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rsc-card rsc-attend">
      <h3 className="rsc-attend-title">Attendance</h3>
      <p className="rsc-attend-hint">
        Upload the attendance PDF for this period. Names are extracted for a quick
        check before the bracket is built.
      </p>
      {message && <p className="rsc-form-error">{message}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className="rsc-btn"
        disabled={phase === 'parsing'}
        onClick={() => fileRef.current?.click()}
      >
        {phase === 'parsing' ? 'Reading PDF…' : 'Upload attendance (PDF)'}
      </button>
    </div>
  );
}
