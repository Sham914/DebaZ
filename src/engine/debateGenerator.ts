export interface RoundData {
  round: number;
  speaker: 'PRO' | 'CON';
  headline: string;
  argument: string;
  data_points: string[];
  emotion_score: number;
  logic_score: number;
  rebuttal_strength: number;
  total_score: number;
}

interface TopicArgs {
  topic: string;
  proHeadline: string;
  conHeadline: string;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const STATS = [
  '73% of researchers agree',
  'Studies show a 45% improvement',
  'According to 2025 data, over 60% of users report positive outcomes',
  'A Harvard study found 82% correlation',
  'Global surveys indicate 3 in 4 experts support this view',
  'Economic models predict a 35% efficiency gain',
  'WHO reports indicate a 50% reduction in related issues',
  'MIT research confirms a 2.7x improvement factor',
  'Data from 40 countries shows consistent positive trends',
  'A meta-analysis of 200 studies confirms the pattern',
];

const EMOTIONAL_SCENARIOS = [
  'Imagine a child discovering their potential because of this',
  'Picture a family whose life was transformed overnight',
  'Think of the single parent who finally found a path forward',
  'Consider the student from a disadvantaged background breaking barriers',
  'Envision communities rebuilding from the ground up',
];

const NEGATIVE_SCENARIOS = [
  'Imagine a community torn apart by unintended consequences',
  'Picture families struggling as traditional safety nets disappear',
  'Think of workers displaced with no alternative in sight',
  'Consider the vulnerable populations left behind by rapid change',
  'Envision a world where the cure becomes worse than the disease',
];

function generateOpening(speaker: 'PRO' | 'CON', topic: string, headline: string): Omit<RoundData, 'total_score'> {
  const isPro = speaker === 'PRO';
  const stat = pickRandom(STATS);

  const proArgs = [
    `The evidence is overwhelming. ${headline} — and the numbers back it up. ${stat}. We stand at a pivotal moment where embracing ${topic.toLowerCase()} can unlock unprecedented human potential. The question isn't whether to act, but how fast we can move forward.`,
    `Let me be crystal clear. ${stat}. ${headline} This isn't speculation — it's the trajectory of progress. Every major advancement in history started with bold adoption. ${topic} is our generation's defining opportunity.`,
    `History will judge us by this moment. ${stat}. ${headline} The benefits of ${topic.toLowerCase()} are documented, measurable, and transformative. Those who resist progress have always been on the wrong side of history.`,
  ];

  const conArgs = [
    `We need to face uncomfortable truths. ${headline} While proponents paint rosy pictures, ${stat.toLowerCase()} — but they ignore the cost. The rush to embrace ${topic.toLowerCase()} without guardrails is reckless and shortsighted.`,
    `Don't be seduced by the hype. ${headline} Yes, ${stat.toLowerCase()}, but correlation isn't causation. The hidden dangers of ${topic.toLowerCase()} are real, documented, and growing. We must pump the brakes before it's too late.`,
    `Here's what they won't tell you. ${headline} ${stat}, sure — but at what price? The uncritical embrace of ${topic.toLowerCase()} threatens the very foundations we've built our progress upon.`,
  ];

  const argument = pickRandom(isPro ? proArgs : conArgs);
  const logic = rand(60, 85);
  const emotion = rand(40, 65);

  return {
    round: 1,
    speaker,
    headline: `ROUND 1: OPENING — ${headline}`,
    argument,
    data_points: [stat],
    emotion_score: emotion,
    logic_score: logic,
    rebuttal_strength: 0,
  };
}

function generateRebuttal(speaker: 'PRO' | 'CON', topic: string, opponentArg: RoundData): Omit<RoundData, 'total_score'> {
  const isPro = speaker === 'PRO';
  const oppWords = opponentArg.argument.split(/\s+/);
  const keyword = oppWords.filter(w => w.length > 5)[Math.floor(Math.random() * 3)] || topic.split(' ')[0];

  const proRebuttals = [
    `My opponent mentioned "${keyword}" — but let's examine this claim critically. Their argument crumbles under scrutiny. The so-called risks are theoretical, while the benefits are tangible and measurable. You can't build the future with fear.`,
    `Interesting that "${keyword}" was brought up. This actually proves MY point. Every transformative technology faced resistance. The real danger isn't moving forward — it's standing still while the world evolves around us.`,
    `Let's address the "${keyword}" argument directly. My opponent cherry-picks concerns while ignoring overwhelming evidence. Progress requires courage, not caution. The data speaks louder than fear.`,
  ];

  const conRebuttals = [
    `My opponent uses "${keyword}" to paint an optimistic picture — but optimism isn't a strategy. Their argument ignores systemic risks that affect millions. We cannot gamble with people's futures based on incomplete data.`,
    `The mention of "${keyword}" reveals a critical blind spot. My opponent sees only upside while dismissing documented downsides. Responsible progress means acknowledging ALL consequences, not just convenient ones.`,
    `Let's talk about "${keyword}" — because my opponent's framing is dangerously one-sided. History is littered with innovations that promised utopia and delivered chaos. Skepticism isn't fear; it's wisdom.`,
  ];

  const argument = pickRandom(isPro ? proRebuttals : conRebuttals);
  const logic = rand(65, 90);
  const emotion = rand(45, 70);
  const rebuttal = rand(60, 90);

  return {
    round: 2,
    speaker,
    headline: `ROUND 2: REBUTTAL — CHALLENGING THE OPPOSITION`,
    argument,
    data_points: [`Referenced opponent keyword: "${keyword}"`],
    emotion_score: emotion,
    logic_score: logic,
    rebuttal_strength: rebuttal,
  };
}

function generateEvidence(speaker: 'PRO' | 'CON', topic: string): Omit<RoundData, 'total_score'> {
  const isPro = speaker === 'PRO';

  const proEvidence = [
    [`Productivity increases by ${rand(25, 60)}% in adoption studies`, `${rand(70, 95)}% of early adopters report satisfaction`, `Economic output grows by $${rand(2, 15)} billion annually in supporting sectors`],
    [`Academic performance improves by ${rand(20, 45)}% with integration`, `${rand(60, 88)}% reduction in resource waste documented`, `Innovation patents increased ${rand(3, 8)}x in related fields since 2020`],
    [`Quality of life index rises ${rand(15, 40)} points in implementing regions`, `Healthcare costs drop by ${rand(10, 35)}% through related improvements`, `${rand(80, 97)}% of industry leaders advocate for accelerated adoption`],
  ];

  const conEvidence = [
    [`${rand(30, 55)}% of affected workers report negative impacts`, `Mental health concerns increased ${rand(2, 5)}x in heavy-use demographics`, `$${rand(5, 20)} billion in annual damages attributed to misuse`],
    [`${rand(40, 65)}% of regulatory bodies flag serious concerns`, `Privacy violations increased by ${rand(200, 500)}% in the past 3 years`, `${rand(3, 7)} major incidents documented in the last 12 months alone`],
    [`Income inequality widened by ${rand(15, 35)}% in early-adoption regions`, `${rand(25, 50)}% of small businesses face existential threats`, `Environmental costs estimated at ${rand(1, 10)} million tons of CO2 equivalent`],
  ];

  const points = pickRandom(isPro ? proEvidence : conEvidence);
  const argument = `The evidence speaks for itself. Let me present three undeniable facts:\n\n• ${points[0]}\n• ${points[1]}\n• ${points[2]}\n\nThese aren't opinions — they're verified data points that ${isPro ? 'prove the transformative potential' : 'expose the real costs'} of ${topic.toLowerCase()}.`;

  return {
    round: 3,
    speaker,
    headline: `ROUND 3: EVIDENCE — DATA SPEAKS`,
    argument,
    data_points: points,
    emotion_score: rand(30, 55),
    logic_score: rand(75, 95),
    rebuttal_strength: rand(50, 75),
  };
}

function generateEmotional(speaker: 'PRO' | 'CON', topic: string): Omit<RoundData, 'total_score'> {
  const isPro = speaker === 'PRO';
  const scenario = pickRandom(isPro ? EMOTIONAL_SCENARIOS : NEGATIVE_SCENARIOS);

  const proArgs = [
    `${scenario}. This isn't abstract policy — it's about real human lives. Every day we delay embracing ${topic.toLowerCase()}, someone misses their chance at a better life. I've seen the hope in people's eyes when they experience what's possible. Can we really deny them that future?`,
    `Close your eyes for a moment. ${scenario}. That's what ${topic.toLowerCase()} makes possible. Behind every statistic is a human story of transformation. We have the power to make this real for millions. How can we look them in the eye and say "not yet"?`,
  ];

  const conArgs = [
    `${scenario}. This isn't fear-mongering — it's reality. While my opponent speaks of progress, real people are paying the price. I've witnessed the devastation firsthand. We cannot sacrifice human dignity on the altar of innovation.`,
    `Let me make this personal. ${scenario}. The human cost of reckless adoption isn't a footnote — it's a headline. Every rushed implementation leaves casualties. Are we willing to tell those affected that they're acceptable losses?`,
  ];

  const argument = pickRandom(isPro ? proArgs : conArgs);
  const emotion = rand(80, 98);
  const logic = rand(35, 60);

  return {
    round: 4,
    speaker,
    headline: `ROUND 4: EMOTIONAL APPEAL — THE HUMAN COST`,
    argument,
    data_points: [scenario],
    emotion_score: emotion,
    logic_score: logic,
    rebuttal_strength: rand(40, 70),
  };
}

function generateClosing(speaker: 'PRO' | 'CON', topic: string): Omit<RoundData, 'total_score'> {
  const isPro = speaker === 'PRO';

  const proClosings = [
    `The future belongs to the bold. ${topic} isn't just an option — it's an imperative. Progress waits for no one. Choose forward. Choose courage. Choose the future.`,
    `History remembers the builders, not the blockers. ${topic} is humanity's next great leap. Stand with progress. Stand with possibility. Stand with tomorrow.`,
    `In every generation, there's a moment that defines everything. This is ours. Embrace ${topic.toLowerCase()}. Embrace progress. The best is yet to come.`,
  ];

  const conClosings = [
    `Wisdom isn't about saying yes to everything — it's about knowing when to say "not like this." ${topic} needs guardrails, not cheerleaders. Choose wisdom. Choose caution. Choose humanity.`,
    `Speed without direction is just chaos. Before we race forward with ${topic.toLowerCase()}, we must ask: at what cost? Some prices are too high. Protect what matters most.`,
    `The measure of a society isn't how fast it moves, but who it protects along the way. ${topic} demands responsibility, not recklessness. Think before you leap.`,
  ];

  const argument = pickRandom(isPro ? proClosings : conClosings);

  return {
    round: 5,
    speaker,
    headline: `ROUND 5: CLOSING — FINAL STATEMENT`,
    argument,
    data_points: [],
    emotion_score: rand(70, 90),
    logic_score: rand(70, 90),
    rebuttal_strength: rand(50, 80),
  };
}

export function generateFullDebate(topic: string, proHeadline: string, conHeadline: string): RoundData[] {
  const args: TopicArgs = { topic, proHeadline, conHeadline };
  const rounds: RoundData[] = [];

  const generators = [
    (s: 'PRO' | 'CON') => generateOpening(s, args.topic, s === 'PRO' ? args.proHeadline : args.conHeadline),
    (s: 'PRO' | 'CON') => generateRebuttal(s, args.topic, rounds[rounds.length - 1]),
    (s: 'PRO' | 'CON') => generateEvidence(s, args.topic),
    (s: 'PRO' | 'CON') => generateEmotional(s, args.topic),
    (s: 'PRO' | 'CON') => generateClosing(s, args.topic),
  ];

  for (let i = 0; i < 5; i++) {
    const proRound = generators[i]('PRO');
    const proTotal = calcTotal(proRound);
    rounds.push({ ...proRound, total_score: proTotal });

    const conRound = generators[i]('CON');
    const conTotal = calcTotal(conRound);
    rounds.push({ ...conRound, total_score: conTotal });
  }

  return rounds;
}

function calcTotal(r: Omit<RoundData, 'total_score'>): number {
  const wordCount = r.argument.split(/\s+/).length;
  let score = wordCount * 0.5 + r.logic_score + r.emotion_score + r.rebuttal_strength;
  if (r.logic_score > 75 && r.emotion_score > 75) score += 50;
  return Math.round(score);
}
