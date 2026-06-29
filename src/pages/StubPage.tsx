import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter';
import '@/styles/racket.css';

interface Props {
  eyebrow: string;
  title: string;
  /** Optional accent for the rule under the title (sport pages use it). */
  accent?: string;
}

/** Placeholder for pages not built yet — keeps the broadcast theme intact. */
export default function StubPage({ eyebrow, title, accent }: Props) {
  return (
    <div className="rsc-stub">
      <div className="rsc-stub-body">
        <p className="rsc-eyebrow">{eyebrow}</p>
        <h1 className="rsc-title rsc-stub-title">{title}</h1>
        <hr
          className="rsc-rule"
          style={accent ? ({ background: accent } as CSSProperties) : undefined}
        />
        <p className="rsc-stub-note">Tournament setup is coming soon.</p>
        <Link className="rsc-link" to="/">
          Back to home
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
