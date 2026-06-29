// Per-sport lesson plans. All three are Ages 9–16, 1.5 hours, and share the
// same seven sections in order. Each section carries its time allocation; items
// may have one level of sub-bullets (e.g. ice breakers, Bullseye Battle).
import type { Sport } from '@/lib/tournament';

export interface LessonItem {
  text: string;
  sub?: string[];
}
export interface LessonSection {
  title: string;
  /** Time allocation shown in the header, e.g. "10 min". */
  duration: string;
  items: LessonItem[];
}

export const LESSON_PLAN_META = 'Ages 9–16 · 1.5 hours';

// ---- Blocks shared verbatim across sports ----
const ICE_BREAKERS: LessonItem = {
  text: 'Ice breakers:',
  sub: [
    'Splat — instructor in the middle, points fingers to “splat” someone',
    'Human bingo — create a sheet where players find someone with a pet, who plays an instrument, has a sibling, etc.',
    'Toe game — players in a circle, eyes on toes when the instructor says go',
  ],
};

const RULES_STANDARD: LessonItem[] = [
  'Reapply sunscreen before lesson — hat, sunscreen, water bottle',
  'Explain racket safety, spacing, and court boundaries',
  'Introduce basic scoring in simple terms',
  'Show how to wait safely between rallies',
].map((text) => ({ text }));

const GAME_TIME: LessonSection = {
  title: 'Game Time',
  duration: '25 min',
  items: [
    { text: 'Royal Court Challenge' },
    { text: 'World Tour' },
    { text: 'Bullseye Battle' },
    { text: 'Beat Your Best' },
  ],
};

const CELEBRATE: LessonSection = {
  title: 'Celebrate',
  duration: '5 min',
  items: [
    {
      text: 'Give out AAAs and have each person say one new thing they learned (could add to confidence stories)',
    },
    { text: 'One encouragement to another guest' },
  ],
};

// Bullseye Battle differs only in its equipment line per sport.
const bullseye = (equipment: string): LessonItem => ({
  text: 'Bullseye Battle (10 mins):',
  sub: [
    `Equipment: ${equipment}`,
    'Set up: create three target zones worth 1, 3, and 5 points',
    'How to play: players each have five serves, score based on where the ball lands, highest score wins',
    'Progressions: ⭐ smaller targets / ⭐⭐ serve from further back / ⭐⭐⭐ backhand serves only',
  ],
});

const TENNIS: LessonSection[] = [
  {
    title: 'Break the Ice',
    duration: '10 min',
    items: [
      { text: 'Warm Up (this is also time to start covering rules) — line games and stretches' },
      { text: 'Activity flow explanation' },
      ICE_BREAKERS,
    ],
  },
  { title: 'Rules & Safety', duration: '5 min', items: RULES_STANDARD },
  {
    title: 'Basic Skills',
    duration: '20 min',
    items: [
      { text: 'Forehand groundstrokes' },
      { text: 'Backhand groundstrokes' },
      { text: 'Ready position and footwork' },
      {
        text: 'Younger players can use bounce-catch-hit drills, while older players can rally from the baseline',
      },
    ],
  },
  {
    title: 'Progression Time',
    duration: '20 min',
    items: [
      { text: 'Serve practice from close range or full service line' },
      { text: 'Volley basics at the net' },
      { text: 'Rally challenge with movement' },
      bullseye('6 cones, balls, rackets'),
    ],
  },
  GAME_TIME,
  CELEBRATE,
  {
    title: 'Leave It Better',
    duration: '5 min',
    items: [
      { text: 'Collect balls, rackets, and cones' },
      { text: 'Check the court area' },
      { text: 'Last but not least: headcount before sending guests off to another activity' },
    ],
  },
];

const PICKLEBALL: LessonSection[] = [
  {
    title: 'Break the Ice',
    duration: '10 min',
    items: [
      { text: 'Warm Up (start covering rules)' },
      { text: 'Activity flow explanation' },
      ICE_BREAKERS,
    ],
  },
  {
    title: 'Rules & Safety',
    duration: '5 min',
    items: [
      { text: 'Reapply sunscreen before lesson — hat, sunscreen, water bottle' },
      { text: 'List all rules that would appear on the rules sign' },
    ],
  },
  {
    title: 'Basic Skills',
    duration: '20 min',
    items: [
      { text: 'Easy basic shots' },
      {
        text: 'Forehand paddle control — coach should look for: side-on stance, eyes on the ball, paddle finishes towards target, small controlled swing',
      },
      { text: 'Backhand paddle control' },
      { text: 'Soft dinking practice near the kitchen line' },
      { text: 'Basic serve and return practice with paired partners' },
    ],
  },
  {
    title: 'Progression Time',
    duration: '20 min',
    items: [
      {
        text: 'Rally challenge: players work in pairs, begin approximately 2 metres apart, count consecutive shots without the ball touching the floor, if successful take one step backwards to increase difficulty, encourage communication and controlled shots over power. Challenge: can any pair reach 20 rallies?',
      },
      { text: 'Serve to target zones' },
      { text: 'Volley reaction games for older or more advanced players' },
      { text: 'Mini doubles drills with rotating partners' },
      bullseye('6 cones, pickleballs, paddles'),
    ],
  },
  GAME_TIME,
  CELEBRATE,
  {
    title: 'Leave It Better',
    duration: '5 min',
    items: [
      { text: 'Pick up balls, paddles, and cones' },
      { text: 'Check the court and surrounding area' },
      { text: 'Last but not least: headcount before sending guests off to another activity' },
    ],
  },
];

const BADMINTON: LessonSection[] = [
  {
    title: 'Break the Ice',
    duration: '10 min',
    items: [
      { text: 'Warm Up (this is also time to start covering rules) — line games and stretches' },
      { text: 'Activity flow explanation' },
      ICE_BREAKERS,
    ],
  },
  { title: 'Rules & Safety', duration: '5 min', items: RULES_STANDARD },
  {
    title: 'Basic Skills',
    duration: '20 min',
    items: [
      { text: 'Grip practice: forehand and backhand grip' },
      { text: 'Racket control: tapping shuttle up and down' },
      { text: 'Underarm hitting: players feed and return shuttles from close range' },
      { text: 'Use easier feeds for younger children and more accurate targets for older players' },
    ],
  },
  {
    title: 'Progression Time',
    duration: '20 min',
    items: [
      { text: 'Clear shots to the back of the court' },
      { text: 'Drop shot practice over a low net' },
      { text: 'Serving practice from the correct service box' },
      bullseye('6 cones, shuttles, rackets'),
    ],
  },
  GAME_TIME,
  CELEBRATE,
  {
    title: 'Leave It Better',
    duration: '5 min',
    items: [
      { text: 'Collect shuttles and rackets' },
      { text: 'Check court area for rubbish and lost property' },
      { text: 'Last but not least: headcount before sending guests off to another activity' },
    ],
  },
];

export const LESSON_PLANS: Record<Sport, LessonSection[]> = {
  tennis: TENNIS,
  pickleball: PICKLEBALL,
  badminton: BADMINTON,
};
