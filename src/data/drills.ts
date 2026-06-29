export const DRILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type DrillLevel = (typeof DRILL_LEVELS)[number];

export interface Drill {
  id: string;
  name: string;
  /** Free-form so each sport can use its own categories. */
  category: string;
  level: DrillLevel;
  /** Minutes to run the drill. */
  duration: number;
  description: string;
  /** Quick coaching cues / tags to call out. */
  cues: string[];
}

/** Reference drills counselors can pull up courtside. Edit freely. */
export const DRILLS: Drill[] = [
  {
    id: 'd1',
    name: 'Mini Tennis Rally',
    category: 'Groundstrokes',
    level: 'Beginner',
    duration: 10,
    description:
      'Players rally inside the service boxes using soft, controlled strokes to build consistency and feel.',
    cues: ['Short backswing', 'Watch the ball', 'Gentle topspin', 'Recover to center'],
  },
  {
    id: 'd2',
    name: 'Cross-Court Consistency',
    category: 'Groundstrokes',
    level: 'Intermediate',
    duration: 15,
    description:
      'Two players hit cross-court forehands, counting how many in a row they can keep in. Switch to backhands.',
    cues: ['Aim past the service line', 'Turn shoulders early', 'Follow through high'],
  },
  {
    id: 'd3',
    name: 'Target Serves',
    category: 'Serve',
    level: 'Beginner',
    duration: 12,
    description:
      'Place cones in the service box corners. Players earn points for hitting targets on first and second serves.',
    cues: ['Toss in front', 'Reach up to the ball', 'Smooth tempo'],
  },
  {
    id: 'd4',
    name: 'Volley Wall Hands',
    category: 'Volley',
    level: 'Intermediate',
    duration: 10,
    description:
      'Quick-hands volley exchange close to the net to develop reaction time and a stable racquet face.',
    cues: ['Hands out front', 'Punch, don’t swing', 'Split-step on contact'],
  },
  {
    id: 'd5',
    name: 'Spider Run',
    category: 'Footwork',
    level: 'Beginner',
    duration: 8,
    description:
      'Footwork race from the center mark to five court points and back. Great warm-up and conditioning.',
    cues: ['Stay low', 'Quick first step', 'Touch the line'],
  },
  {
    id: 'd6',
    name: 'King of the Court',
    category: 'Games',
    level: 'Advanced',
    duration: 20,
    description:
      'Challenger plays a short point against the “king.” Winner stays, loser rotates out. Keeps a big group moving.',
    cues: ['First strike tennis', 'Move the king side to side', 'Compete every point'],
  },
  {
    id: 'd7',
    name: 'Approach & Volley',
    category: 'Volley',
    level: 'Advanced',
    duration: 15,
    description:
      'Coach feeds a short ball; player hits an approach shot, closes the net, and finishes with a volley.',
    cues: ['Approach down the line', 'Close to the net', 'Finish high'],
  },
  {
    id: 'd8',
    name: 'Around the World',
    category: 'Games',
    level: 'Beginner',
    duration: 15,
    description:
      'Players line up on both sides, hit one ball, then run to the other side. Miss and you’re out — last one standing wins.',
    cues: ['One controlled shot', 'Run with your racquet ready', 'Have fun!'],
  },
];

export const DRILL_CATEGORIES = [
  'Groundstrokes',
  'Serve',
  'Volley',
  'Footwork',
  'Games',
] as const;
