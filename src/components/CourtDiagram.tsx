export type Sport = 'tennis' | 'pickleball' | 'badminton';

/**
 * Top-down, to-scale line-art court maps (net runs horizontally across the
 * middle). Lines are neutral white; the sport's accent lives only on the
 * panel's bottom border, per the design brief. Coordinates are derived from
 * real court dimensions so the markings are accurate, not decorative.
 */
const LINE = 'rgba(255,255,255,0.82)';
const NET = 'rgba(255,255,255,0.92)';

const stroke = {
  stroke: LINE,
  strokeWidth: 1.4,
  fill: 'none',
  strokeLinecap: 'square' as const,
};

const net = {
  stroke: NET,
  strokeWidth: 1.6,
  strokeDasharray: '2 3',
};

export default function CourtDiagram({ sport }: { sport: Sport }) {
  if (sport === 'tennis') {
    // 36ft × 78ft doubles court. Doubles alley 4.5ft, service line 21ft from net.
    return (
      <svg className="rsc-court" viewBox="0 0 180 320" role="img" aria-label="Tennis court">
        <rect x="25" y="20" width="130" height="280" {...stroke} />
        {/* singles sidelines */}
        <line x1="41.25" y1="20" x2="41.25" y2="300" {...stroke} />
        <line x1="138.75" y1="20" x2="138.75" y2="300" {...stroke} />
        {/* service lines (across singles width) */}
        <line x1="41.25" y1="84.6" x2="138.75" y2="84.6" {...stroke} />
        <line x1="41.25" y1="235.4" x2="138.75" y2="235.4" {...stroke} />
        {/* centre service line */}
        <line x1="90" y1="84.6" x2="90" y2="235.4" {...stroke} />
        {/* centre marks on the baselines */}
        <line x1="90" y1="20" x2="90" y2="28" {...stroke} />
        <line x1="90" y1="292" x2="90" y2="300" {...stroke} />
        {/* net (extends past sidelines to suggest the posts) */}
        <line x1="20" y1="160" x2="160" y2="160" {...net} />
      </svg>
    );
  }

  if (sport === 'pickleball') {
    // 20ft × 44ft court. Non-volley zone (kitchen) 7ft from net each side.
    // Centre line splits the service areas but does not cross the kitchen.
    return (
      <svg className="rsc-court" viewBox="0 0 180 320" role="img" aria-label="Pickleball court">
        <rect x="26" y="20" width="128" height="280" {...stroke} />
        {/* non-volley zone lines */}
        <line x1="26" y1="115.5" x2="154" y2="115.5" {...stroke} />
        <line x1="26" y1="204.5" x2="154" y2="204.5" {...stroke} />
        {/* centre line (only outside the kitchen) */}
        <line x1="90" y1="20" x2="90" y2="115.5" {...stroke} />
        <line x1="90" y1="204.5" x2="90" y2="300" {...stroke} />
        <line x1="21" y1="160" x2="159" y2="160" {...net} />
      </svg>
    );
  }

  // badminton — 20ft × 44ft doubles court. Singles sidelines inset 1.5ft,
  // short service line 6.5ft from net, doubles long service line 2.5ft from back.
  return (
    <svg className="rsc-court" viewBox="0 0 180 320" role="img" aria-label="Badminton court">
      <rect x="26" y="20" width="128" height="280" {...stroke} />
      {/* singles sidelines */}
      <line x1="35.6" y1="20" x2="35.6" y2="300" {...stroke} />
      <line x1="144.4" y1="20" x2="144.4" y2="300" {...stroke} />
      {/* short service lines */}
      <line x1="26" y1="118.6" x2="154" y2="118.6" {...stroke} />
      <line x1="26" y1="201.4" x2="154" y2="201.4" {...stroke} />
      {/* doubles long service lines */}
      <line x1="26" y1="35.9" x2="154" y2="35.9" {...stroke} />
      <line x1="26" y1="284.1" x2="154" y2="284.1" {...stroke} />
      {/* centre line splitting the service courts (short line → back boundary) */}
      <line x1="90" y1="20" x2="90" y2="118.6" {...stroke} />
      <line x1="90" y1="201.4" x2="90" y2="300" {...stroke} />
      <line x1="21" y1="160" x2="159" y2="160" {...net} />
    </svg>
  );
}
